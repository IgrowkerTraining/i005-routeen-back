import { NextResponse } from "next/server";
import RoutineAssigned from "@/models/RoutineAssigned";
import Trainer from "@/models/Trainer";
import Athlete from "@/models/Athlete";
import connect from "@/lib/db";
import { MongooseError } from "mongoose";
import validate from "@/lib/validate";
import { getCurrentUser } from "@/lib/getCurrentUser";