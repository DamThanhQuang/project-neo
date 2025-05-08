import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DashboardDocument = HydratedDocument<Dashboard>;

@Schema({ timestamps: true })
export class Dashboard {
    @Prop({type: Types.ObjectId, ref: 'Business', required: true})
    businessId: string;

    @Prop({type: Types.ObjectId, ref: "Product", required: true})
    productId : string;

    @Prop()
    visitors: string;

    @Prop({default: Date.now})
    lastActiveTime: Date;

    @Prop()
    deviceInfo: string;

    @Prop()
    referrer: string;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);