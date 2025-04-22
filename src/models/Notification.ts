import { Schema, InferSchemaType, model, models, Types } from "mongoose";
import Trainer from "./Trainer";
import Athlete from "./Athlete";



const { ObjectId } = Types;

const NotificationSchema = new Schema({
    trainer_id:{type: ObjectId, ref:"Trainer",required:true},
    athlete_id:{type:ObjectId, ref:"Athlete", required:true},
    message:{type:String, required:true},
    read: { type: Boolean, default: false },
},
{
    timestamps:true
}
);

const Notification = models.Notification || model("Notification", NotificationSchema);
export type NotificationType = InferSchemaType<typeof NotificationSchema>;
export default Notification;

