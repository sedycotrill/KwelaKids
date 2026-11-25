import {
    Fragment,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    type CSSProperties,
} from "react";

import { useNavigate } from "react-router-dom";

import { ArrowLeft, Lock, Play, Volume2, VolumeX, Languages } from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

import { useAudio } from "../../../context/AudioContext";

import { useAuth } from "../../../context/AuthContext";

import { supabase } from "../../../lib/supabase";

import theoreticalImage from "../../../assets/theoretical.svg";

import championshipImage from "../../../assets/championship.svg";

import ropeImage from "../../../assets/rope.svg";

// Update this if your Championship component uses a different route.
const CHAMPIONSHIP_ROUTE = "/championship";

// Shared "chunky 3D" button look
const chunkyButtonBase =
  "flex shrink-0 items-center rounded-2xl border-b-4 font-extrabold " +
  "whitespace-nowrap " +
  "transition-all duration-150 select-none " +
  "hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

// Desktop: fixed size (hindi nagbabago kapag nag-zoom).
// Mobile: responsive sizes para sa totoong phone/tablet.
const getChunkyButton = (isDesktop: boolean) =>
  chunkyButtonBase +
  (isDesktop
    ? " h-12 gap-2 px-4 text-base"
    : " h-11 gap-1.5 px-3 text-sm sm:h-12 sm:gap-2 sm:px-4 sm:text-base");

/*
 * DESKTOP MAP SIZE
 * Ang mga posisyon ng islands at ropes ay dinisenyo sa isang "stage" na may
 * fixed na laki. Ang stage na ito ay pinapaliit o pinalalaki bilang isang buo
 * (islands + ropes + text), kaya hindi na nagbabago ang itsura kapag nag-zoom
 * in/out o iba ang laki ng screen.
 *
 * Kung gusto mong ibahin ang proporsyon ng mapa, palitan lang ang dalawang ito.
 */
const MAP_DESIGN_WIDTH = 1366;
const MAP_DESIGN_HEIGHT = 640;

/*
 * RESPONSIVE STAGES
 * Parehong islands, ropes at text ang ginagamit; dalawa lang ang "hugis" ng
 * stage:
 *  - LANDSCAPE: ang orihinal na mapa (para sa malalapad na screen).
 *  - PORTRAIT: parehong mapa pero naka-zigzag pataas (para sa phone/tablet
 *    na nakatayo), kaya mas malaki ang labas ng mga isla.
 * Sa maliliit na screen, kusang pinipili ang hugis na mas malaki ang labas.
 */
interface StageLayout {
    width: number;
    height: number;
}

const LANDSCAPE_LAYOUT: StageLayout = {
    width: MAP_DESIGN_WIDTH,
    height: MAP_DESIGN_HEIGHT,
};

const PORTRAIT_LAYOUT: StageLayout = { width: 400, height: 920 };

const DESKTOP_LAYOUTS: readonly StageLayout[] = [LANDSCAPE_LAYOUT];

const COMPACT_LAYOUTS: readonly StageLayout[] = [
    LANDSCAPE_LAYOUT,
    PORTRAIT_LAYOUT,
];

// Posisyon ng bawat isla sa PORTRAIT stage (1 = ibaba, 3 = itaas).
const PORTRAIT_SLOT_WIDTH = 180;
const PORTRAIT_ISLAND_BOX = 136;

const PORTRAIT_SLOTS = [
    { x: 14, y: 630 },
    { x: 206, y: 335 },
    { x: 14, y: 30 },
].map((slot) => ({
    ...slot,
    center: {
        x: slot.x + PORTRAIT_SLOT_WIDTH / 2,
        y: slot.y + PORTRAIT_ISLAND_BOX / 2,
    },
}));

/*
 * Ang rope.svg ay iginuhit para sa kahong 478x256 (35% x 40% ng landscape
 * stage), pababa-kaliwa papuntang itaas-kanan. Para sa PORTRAIT stage, hindi
 * ito iniuunat; iniikot at pinaliliit lang nang pantay para dumugtong sa
 * dalawang isla, kaya hindi nagbabago ang itsura at kapal ng rope.
 */
const ROPE_WIDTH = 478;
const ROPE_HEIGHT = 256;

function getRopeStyle(
    from: { x: number; y: number },
    to: { x: number; y: number }
): CSSProperties {
    const flip = to.x < from.x;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    const scale = Math.hypot(dx, dy) / Math.hypot(ROPE_WIDTH, ROPE_HEIGHT);
    const width = ROPE_WIDTH * scale;
    const height = ROPE_HEIGHT * scale;

    const naturalAngle = Math.atan2(-ROPE_HEIGHT, flip ? -ROPE_WIDTH : ROPE_WIDTH);
    const targetAngle = Math.atan2(dy, dx);
    const rotation = ((targetAngle - naturalAngle) * 180) / Math.PI;

    return {
        left: (from.x + to.x) / 2 - width / 2,
        top: (from.y + to.y) / 2 - height / 2,
        width,
        height,
        transform: `rotate(${rotation}deg)${flip ? " scaleX(-1)" : ""}`,
        transformOrigin: "center",
    };
}

function useFitStage(layouts: readonly StageLayout[]) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [fit, setFit] = useState({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        layoutIndex: 0,
    });

    useLayoutEffect(() => {
        const element = containerRef.current;

        if (!element) return;

        const update = () => {
            const width = element.clientWidth;
            const height = element.clientHeight;

            if (!width || !height) return;

            // Piliin ang stage na pinakamalaki ang labas sa available na espasyo.
            let layoutIndex = 0;
            let scale = 0;

            layouts.forEach((layout, index) => {
                const candidate = Math.min(
                    width / layout.width,
                    height / layout.height
                );

                if (candidate > scale) {
                    scale = candidate;
                    layoutIndex = index;
                }
            });

            const layout = layouts[layoutIndex];

            setFit({
                scale,
                offsetX: (width - layout.width * scale) / 2,
                offsetY: (height - layout.height * scale) / 2,
                layoutIndex,
            });
        };

        update();

        const observer = new ResizeObserver(update);
        observer.observe(element);

        return () => observer.disconnect();
    }, [layouts]);

    return { containerRef, fit };
}

/*
 * COMPACT (MOBILE) VIEW DETECTION
 * Lapad ng viewport ang basehan: <= 1023px = phone/tablet na layout
 * (header sa itaas na hindi napapaliit, mapa sa natitirang espasyo).
 */
const MOBILE_MAX_WIDTH = 1023;

function detectMobileView() {
    if (typeof window === "undefined") return false;

    return window.innerWidth <= MOBILE_MAX_WIDTH;
}

function useIsMobileView() {
    const [isMobile, setIsMobile] = useState(detectMobileView);

    useEffect(() => {
        const update = () => setIsMobile(detectMobileView());

        update();

        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, []);

    return isMobile;
}

interface TutorialProgress {
    part_key: "part_1" | "part_2";
    tutorial_completed_at: string | null;
}

interface IslandProps {
    image: string;
    name: string;
    actionLabel: string;
    locked: boolean;
    loading: boolean;
    completed?: boolean;
    completedLabel?: string;
    ariaLabel: string;
    onOpen: () => void;
    className?: string;
    isDesktop?: boolean;
}

function Island({
    image,
    name,
    actionLabel,
    locked,
    loading,
    completed = false,
    completedLabel = "Completed",
    ariaLabel,
    onOpen,
    className = "",
    isDesktop = false,
}: IslandProps) {
    const isDisabled = locked || loading;

    return (
        <button
            type="button"
            onClick={onOpen}
            disabled={isDisabled}
            aria-label={ariaLabel}
            className={`
                group z-10 flex flex-col items-center rounded-3xl
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400
                ${
                    isDisabled
                        ? "cursor-not-allowed pointer-events-none opacity-60"
                        : "cursor-pointer pointer-events-auto"
                }
                ${className}
            `}
        >
            {/* Island picture */}
            <span
                className={`relative flex items-center justify-center overflow-visible ${
                    isDesktop ? "h-56 w-56" : "h-34 w-34"
                }`}
            >
                <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className={`
                        pointer-events-none h-full w-full object-contain
                        transition-all duration-300 ease-in-out motion-reduce:transition-none
                        ${isDesktop ? "scale-400" : "scale-275"}
                        ${
                            isDisabled
                                ? "grayscale"
                                : isDesktop
                                    ? `group-hover:-translate-y-2 group-hover:brightness-110
                                       group-hover:drop-shadow-[0_0_18px_rgba(255,210,50,0.8)]
                                       group-active:scale-380`
                                    : `group-hover:-translate-y-1.5 group-hover:brightness-110
                                       group-hover:drop-shadow-[0_0_16px_rgba(255,210,50,0.8)]`
                        }
                    `}
                />
            </span>

            {/* Island name */}
            <span
                className={`mt-1.5 rounded-full bg-white/95 px-3.5 py-1 font-black text-[#164B9B] shadow-xs ${
                    isDesktop ? "text-lg" : "text-sm sm:text-base"
                }`}
            >
                {name}
            </span>

            {/* Completed label */}
            {completed && (
                <span className={`mt-1 rounded-full bg-green-100 px-3 py-0.5 font-extrabold text-green-700 shadow-sm ${isDesktop ? "text-xs" : "text-xs"}`}>
                    {completedLabel}
                </span>
            )}

            {/* Action / status pill */}
            <span
                className={`
                    mt-2 flex items-center gap-1.5 whitespace-nowrap rounded-full border-b-4 px-4 py-1.5
                    ${isDesktop ? "px-5 py-2 text-base" : "text-xs sm:text-sm"} font-extrabold transition-all duration-150 motion-reduce:transition-none
                    ${
                        isDisabled
                            ? "border-slate-300 bg-slate-100 text-slate-500"
                            : "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8] group-hover:-translate-y-0.5 group-hover:bg-[#D8BCFF] group-active:translate-y-0.5 group-active:border-b-2"
                    }
                `}
            >
                {isDisabled ? (
                    <Lock size={15} aria-hidden="true" />
                ) : (
                    <Play
                        size={15}
                        aria-hidden="true"
                        className="fill-current"
                    />
                )}

                {actionLabel}
            </span>
        </button>
    );
}

export default function AlphabetPage() {
    const navigate = useNavigate();

    const { language, toggleLanguage } = useLanguage();
    const { isPlaying, volume, toggleMusic } = useAudio();
    const { user, loading: authLoading } = useAuth();

    const isTagalog = language === "tl";
    const isMusicActive = isPlaying && volume > 0;

    // Compact layout para sa maliliit na screen.
    const isMobileView = useIsMobileView();

    // Keeps the desktop map (islands + ropes) in proportion at any zoom level.
    const { containerRef: mapContainerRef, fit: mapFit } = useFitStage(
        isMobileView ? COMPACT_LAYOUTS : DESKTOP_LAYOUTS
    );

    // Sa phone/tablet, kusang pinipili ang portrait stage kapag mas malaki ito.
    const isPortraitStage = isMobileView && mapFit.layoutIndex === 1;

    // Independent progress for each tutorial part.
    const [part1Progress, setPart1Progress] =
        useState<TutorialProgress | null>(null);

    const [part2Progress, setPart2Progress] =
        useState<TutorialProgress | null>(null);

    // Database loading and error handling.
    const [progressLoading, setProgressLoading] = useState(true);

    const [progressError, setProgressError] = useState("");

    const [reloadVersion, setReloadVersion] = useState(0);

    // Completion states.
    const isPart1Completed = Boolean(
        part1Progress?.tutorial_completed_at
    );

    const isPart2Completed = Boolean(
        part2Progress?.tutorial_completed_at
    );

    // Part 2 unlocks after Part 1 is completed.
    const isPart2Unlocked = isPart1Completed;

    // Championship unlocks only after both tutorials are completed.
    const isChampionshipUnlocked =
        isPart1Completed && isPart2Completed;

    // Fetch both tutorial progress records.
    useEffect(() => {
        let isMounted = true;

        const fetchAlphabetProgress = async () => {
            if (authLoading) return;

            if (!user?.id) {
                if (isMounted) {
                    setPart1Progress(null);
                    setPart2Progress(null);
                    setProgressError("");
                    setProgressLoading(false);
                }

                return;
            }

            if (isMounted) {
                setProgressLoading(true);
                setProgressError("");
            }

            try {
                const { data, error } = await supabase
                    .from("alphabet_progress")
                    .select("part_key, tutorial_completed_at")
                    .eq("user_id", user.id)
                    .in("part_key", ["part_1", "part_2"]);

                if (error) throw error;

                if (!isMounted) return;

                const progressRows =
                    (data ?? []) as TutorialProgress[];

                const part1 = progressRows.find(
                    (row) => row.part_key === "part_1"
                );

                const part2 = progressRows.find(
                    (row) => row.part_key === "part_2"
                );

                setPart1Progress(part1 ?? null);

                setPart2Progress(part2 ?? null);
            } catch (error) {
                console.error(
                    "Failed to fetch alphabet progress:",
                    error
                );

                if (isMounted) {
                    setProgressError(
                        isTagalog
                            ? "Hindi makuha ang iyong progreso. Subukan muli."
                            : "Unable to load your progress. Please try again."
                    );

                    setPart1Progress(null);
                    setPart2Progress(null);
                }
            } finally {
                if (isMounted) {
                    setProgressLoading(false);
                }
            }
        };

        void fetchAlphabetProgress();

        return () => {
            isMounted = false;
        };
    }, [user?.id, authLoading, reloadVersion, isTagalog]);

    // Tutorial action labels.
    const getTutorialActionLabel = (
        progress: TutorialProgress | null
    ) => {
        if (progress?.tutorial_completed_at) {
            return isTagalog ? "Rebyuhin" : "Review";
        }

        if (progress) {
            return isTagalog ? "Magpatuloy" : "Continue";
        }

        return isTagalog ? "Simulan" : "Start";
    };

    const loadingLabel = isTagalog
        ? "Naglo-load..."
        : "Loading...";

    const lockedLabel = isTagalog
        ? "Naka-lock"
        : "Locked";

    const part1Name = isTagalog
        ? "Tutorial Bahagi 1"
        : "Part 1 Tutorial";

    const part2Name = isTagalog
        ? "Tutorial Bahagi 2"
        : "Part 2 Tutorial";

    const championshipName = isTagalog
        ? "Kampeonato"
        : "Championship";

    const completedLabel = isTagalog
        ? "Tapos na"
        : "Completed";

    const championshipActionLabel = isChampionshipUnlocked
        ? isTagalog
            ? "Maglaro"
            : "Play"
        : lockedLabel;

    // Island definitions.
    const islands = [
        {
            id: 1,
            image: theoreticalImage,
            name: part1Name,
            position: "left-[13%] top-[52%]",
            locked: false,
            completed: isPart1Completed,
            actionLabel: progressLoading
                ? loadingLabel
                : getTutorialActionLabel(part1Progress),
            onOpen: () => {
                navigate("/alphabettutorial");
            },
        },
        {
            id: 2,
            image: theoreticalImage,
            name: part2Name,
            position: "left-[44%] top-[39%]",
            locked: !isPart2Unlocked,
            completed: isPart2Completed,
            actionLabel: progressLoading
                ? loadingLabel
                : !isPart2Unlocked
                    ? lockedLabel
                    : getTutorialActionLabel(part2Progress),
            onOpen: () => {
                if (isPart2Unlocked) {
                    navigate("/alphabettutorial2");
                }
            },
        },
        {
            id: 3,
            image: championshipImage,
            name: championshipName,
            position: "right-[11%] top-[21%]",
            locked: !isChampionshipUnlocked,
            completed: false,
            actionLabel: progressLoading
                ? loadingLabel
                : championshipActionLabel,
            onOpen: () => {
                if (isChampionshipUnlocked) {
                    navigate(CHAMPIONSHIP_ROUTE);
                }
            },
        },
    ];

    const renderIsland = (
        island: (typeof islands)[number],
        className: string,
        isDesktop: boolean
    ) => (
        <Island
            image={island.image}
            name={island.name}
            locked={island.locked}
            loading={progressLoading}
            completed={island.completed}
            completedLabel={completedLabel}
            actionLabel={island.actionLabel}
            ariaLabel={
                island.locked
                    ? `${island.name}: ${island.actionLabel}`
                    : isTagalog
                        ? `Buksan ang ${island.name}`
                        : `Open ${island.name}`
            }
            onOpen={island.onOpen}
            className={className}
            isDesktop={isDesktop}
        />
    );

    // Header + error message. Rendered once for phones and once inside the
    // scaled desktop layer, so the header keeps its proportions with the map.
    const renderTopBar = (isDesktop: boolean) => (
        <>
            {/* SUB-HEADER */}
            <div
                className={`relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-2 pt-3.5 sm:pt-6 ${
                    isDesktop ? "px-6" : "px-4 sm:px-6"
                }`}
            >
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/categories")}
                        aria-label={
                            isTagalog
                                ? "Bumalik sa mga kategorya"
                                : "Back to categories"
                        }
                        className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none"
                    >
                        <ArrowLeft size={21} strokeWidth={2.5} />
                    </button>

                    <div className="min-w-0">
                        <h1
                            className={`truncate font-black leading-tight text-[#164B9B] ${
                                isDesktop ? "text-3xl" : "text-xl sm:text-3xl"
                            }`}
                        >
                            {isTagalog ? "Alpabeto" : "Alphabet"}
                        </h1>

                        <p
                            className={`line-clamp-1 font-medium text-slate-600 ${
                                isDesktop ? "text-base" : "text-xs sm:text-base"
                            }`}
                        >
                            {isTagalog
                                ? "Matutunan ang mga titik ng alpabetong Filipino."
                                : "Learn the letters of the Filipino alphabet."}
                        </p>
                    </div>
                </div>

                {/* QUICK ACTIONS (Translation & Music/Mute) */}
                <div
                    className={`flex shrink-0 items-center ${
                        isDesktop ? "gap-3" : "gap-1.5 sm:gap-3"
                    }`}
                >
                    {/* LANGUAGE */}
                    <button
                        type="button"
                        onClick={() => toggleLanguage()}
                        aria-label={isTagalog ? "Palitan sa English" : "Switch to Tagalog"}
                        className={`${getChunkyButton(isDesktop)} border-purple-300 bg-purple-100 text-purple-700 hover:bg-purple-200`}
                    >
                        <Languages size={19} />
                        <span>{isTagalog ? "TL" : "EN"}</span>
                    </button>

                    {/* MUSIC / MUTE */}
                    <button
                        type="button"
                        onClick={() => toggleMusic()}
                        aria-pressed={isMusicActive}
                        aria-label={
                            isMusicActive
                                ? isTagalog ? "I-mute ang tugtog" : "Mute music"
                                : isTagalog ? "I-unmute ang tugtog" : "Unmute music"
                        }
                        className={`${getChunkyButton(isDesktop)} ${
                            isMusicActive
                                ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                        {isMusicActive ? (
                            <Volume2 size={19} className="animate-pulse motion-reduce:animate-none" />
                        ) : (
                            <VolumeX size={19} />
                        )}
                        <span className={isDesktop ? "inline" : "hidden"}>
                            {isMusicActive
                                ? isTagalog ? "Tugtog" : "Music"
                                : isTagalog ? "Naka-mute" : "Muted"}
                        </span>
                    </button>
                </div>
            </div>

            {/* DATABASE ERROR MESSAGE */}
            {progressError && (
                <div
                    role="alert"
                    className={`relative z-20 mx-auto mt-3 flex max-w-2xl items-center gap-3 rounded-2xl border border-rose-200 bg-white/95 p-3.5 shadow-sm ${
                        isDesktop
                            ? "flex-row justify-between text-left"
                            : "mx-4 flex-col text-center sm:mx-auto sm:flex-row sm:justify-between sm:text-left"
                    }`}
                >
                    <p className="text-xs sm:text-sm font-semibold text-rose-600">
                        {progressError}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setReloadVersion((previous) => previous + 1)
                        }
                        className="shrink-0 rounded-full bg-rose-500 px-5 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-rose-600"
                    >
                        {isTagalog ? "Subukan muli" : "Retry"}
                    </button>
                </div>
            )}
        </>
    );

    // Ropes + islands. Landscape = orihinal; portrait = parehong elements, naka-zigzag.
    const renderStage = () => {
        const layout = isPortraitStage ? PORTRAIT_LAYOUT : LANDSCAPE_LAYOUT;

        return (
            <div
                className="absolute"
                style={{
                    width: layout.width,
                    height: layout.height,
                    left: mapFit.offsetX,
                    top: mapFit.offsetY,
                    transform: `scale(${mapFit.scale})`,
                    transformOrigin: "top left",
                }}
            >
                {isPortraitStage ? (
                    <>
                        {/* Rope 1: Part 1 to Part 2 */}
                        <img
                            src={ropeImage}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none absolute z-0 object-fill"
                            style={getRopeStyle(
                                PORTRAIT_SLOTS[0].center,
                                PORTRAIT_SLOTS[1].center
                            )}
                        />

                        {/* Rope 2: Part 2 to Championship */}
                        <img
                            src={ropeImage}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none absolute z-0 object-fill"
                            style={getRopeStyle(
                                PORTRAIT_SLOTS[1].center,
                                PORTRAIT_SLOTS[2].center
                            )}
                        />

                        {islands.map((island, index) => (
                            <div
                                key={island.id}
                                className="absolute flex justify-center"
                                style={{
                                    left: PORTRAIT_SLOTS[index].x,
                                    top: PORTRAIT_SLOTS[index].y,
                                    width: PORTRAIT_SLOT_WIDTH,
                                }}
                            >
                                {renderIsland(island, "", false)}
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {/* Rope 1: Part 1 to Part 2 */}
                        <img
                            src={ropeImage}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none absolute left-[15%] top-[39%] z-0 h-[40%] w-[35%] object-fill"
                        />

                        {/* Rope 2: Part 2 to Championship */}
                        <img
                            src={ropeImage}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none absolute left-[52%] top-[27%] z-0 h-[40%] w-[29%] object-fill"
                        />

                        {islands.map((island) => (
                            <Fragment key={island.id}>
                                {renderIsland(
                                    island,
                                    `absolute ${island.position}`,
                                    true
                                )}
                            </Fragment>
                        ))}
                    </>
                )}
            </div>
        );
    };

    return (
        <main
            className={`relative w-full bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] ${
                isMobileView
                    ? "h-dvh overflow-clip"
                    : "min-h-screen overflow-x-clip overflow-y-hidden"
            }`}
        >
            {/* Clouds */}
            <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />

            <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

            <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />

            <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

            {/* Decorative Bottom Clouds */}
            <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />

            <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

            {isMobileView ? (
                /* PHONES AND TABLETS: header sa taas (hindi napapaliit), mapa sa natitirang espasyo */
                <div className="relative z-10 flex h-full flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
                    <div className="relative z-20 shrink-0 pb-2">
                        {renderTopBar(false)}
                    </div>

                    <div
                        ref={mapContainerRef}
                        className="relative min-h-0 flex-1 overflow-hidden"
                    >
                        {renderStage()}
                    </div>
                </div>
            ) : (
                <>
                    {/* DESKTOP: map with ropes (scaled as one piece) */}
                    <div
                        ref={mapContainerRef}
                        className="absolute inset-0 overflow-hidden"
                    >
                        {renderStage()}
                    </div>

                    {/* SUB-HEADER + ERROR MESSAGE: desktop (scaled together with the map) */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
                        <div
                            style={{
                                width: MAP_DESIGN_WIDTH,
                                marginLeft: mapFit.offsetX,
                                transform: `scale(${mapFit.scale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <div className="pointer-events-auto">
                                {renderTopBar(true)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}