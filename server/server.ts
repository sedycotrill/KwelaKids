
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabaseClient.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Backend health check
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "KwelaKids API is running!"
    });
});

// Supabase connection test
app.get("/api/db-check", async (req: Request, res: Response) => {
    try {
        const { error } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Successfully connected to Supabase!"
        });

    } catch (error) {
        console.error("Supabase error:", error);

        res.status(500).json({
            success: false,
            message: "Supabase connection failed."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`KwelaKids API running on port ${PORT}`);
});
