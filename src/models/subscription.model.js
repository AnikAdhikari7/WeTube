import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, // one who is being subscribed to
            ref: "User",
        },
    },
    { timestamps: true }
);

const Subscription = model("Subscription", subscriptionSchema);
export default Subscription;
