
import { Fragment, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { ArrowLeft, Lock, Play } from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";

import { useAuth } from "../../../context/AuthContext";

import { supabase } from "../../../lib/supabase";

import theoreticalImage from "../../../assets/theoretical.svg";

import championshipImage from "../../../assets/championship.svg";

import ropeImage from "../../../assets/rope.svg";

// Update this if your Championship component uses a different route.
const CHAMPIONSHIP_ROUTE = "/championship";

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
            <span className="relative flex h-40 w-40 items-center justify-center overflow-visible sm:h-56 sm:w-56">
                <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className={`
                        pointer-events-none h-full w-full scale-400 object-contain
                        transition-all duration-300 ease-in-out motion-reduce:transition-none
                        ${
                            isDisabled
                                ? "grayscale"
                                : `group-hover:-translate-y-2 group-hover:brightness-110
                                   group-hover:drop-shadow-[0_0_18px_rgba(255,210,50,0.8)]
                                   group-active:scale-380`
                        }
                    `}
                />
            </span>

            {/* Island name */}
            <span className="mt-1 rounded-full bg-white/80 px-4 py-1 text-base font-black text-[#164B9B] shadow-xs sm:text-lg">
                {name}
            </span>

            {/* Completed label */}
            {completed && (
                <span className="mt-1 rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700 shadow-sm">
                    {completedLabel}
                </span>
            )}

            {/* Action / status pill */}
            <span
                className={`
                    mt-2 flex items-center gap-2 whitespace-nowrap rounded-full border-b-4 px-5 py-2
                    text-base font-extrabold transition-all duration-150 motion-reduce:transition-none
                    ${
                        isDisabled
                            ? "border-slate-300 bg-slate-100 text-slate-500"
                            : "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8] group-hover:-translate-y-0.5 group-hover:bg-[#D8BCFF] group-active:translate-y-0.5 group-active:border-b-2"
                    }
                `}
            >
                {isDisabled ? (
                    <Lock size={18} aria-hidden="true" />
                ) : (
                    <Play
                        size={18}
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

    const { language } = useLanguage();

    const { user, loading: authLoading } = useAuth();

    const isTagalog = language === "tl";

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
        className: string
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
        />
    );

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">

            {/* SUB-HEADER */}
            <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/categories")}
                        aria-label={
                            isTagalog
                                ? "Bumalik sa mga kategorya"
                                : "Back to categories"
                        }
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none"
                    >
                        <ArrowLeft size={22} strokeWidth={2.5} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
                            {isTagalog ? "Alpabeto" : "Alphabet"}
                        </h1>

                        <p className="text-sm font-medium text-slate-600 sm:text-base">
                            {isTagalog
                                ? "Matutunan ang mga titik ng alpabetong Filipino."
                                : "Learn the letters of the Filipino alphabet."}
                        </p>
                    </div>
                </div>
            </div>

            {/* DATABASE ERROR MESSAGE */}
            {progressError && (
                <div
                    role="alert"
                    className="relative z-20 mx-auto mt-5 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-white/95 p-4 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left"
                >
                    <p className="text-sm font-semibold text-rose-600">
                        {progressError}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setReloadVersion((previous) => previous + 1)
                        }
                        className="shrink-0 rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-rose-600"
                    >
                        {isTagalog ? "Subukan muli" : "Retry"}
                    </button>
                </div>
            )}

            {/* Clouds */}
            <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />

            <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

            <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />

            <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

            {/* Decorative Bottom Clouds */}
            <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />

            <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

            {/* PHONES AND TABLETS: islands stacked in a zigzag path */}
            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-6 pb-24 pt-8 lg:hidden">
                {islands.map((island, index) => (
                    <Fragment key={island.id}>
                        {index > 0 && (
                            <div
                                aria-hidden="true"
                                className="my-2 h-10 w-0 border-l-4 border-dashed border-white/90"
                            />
                        )}

                        {renderIsland(
                            island,
                            index % 2 === 0
                                ? "self-start"
                                : "self-end"
                        )}
                    </Fragment>
                ))}
            </div>

            {/* DESKTOP: original map with ropes */}
            <div className="absolute inset-0 hidden lg:block">

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
                            `absolute ${island.position}`
                        )}
                    </Fragment>
                ))}
            </div>
        </main>
    );
}
