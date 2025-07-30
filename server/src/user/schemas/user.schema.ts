import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop() firstname: string;
  @Prop() lastname: string;
  @Prop() name: string;
  @Prop() username: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop() avatar: string;

  @Prop() password: string;

  @Prop() location: string;
  @Prop() description: string;
  @Prop() coverImage: string;

  @Prop({ default: 'user' })
  role: 'admin' | 'user' | 'business';

  @Prop({ default: false })
  isBusiness: boolean;

  @Prop({ type: Types.ObjectId, required: false })
  businessId: Types.ObjectId;

  // === Thêm mới cho OAuth ===
  @Prop() provider: string; // 'google'
  @Prop({ unique: true, sparse: true })
  providerId: string; // Google 'sub' (profile.id)

  // (tuỳ chọn) một số field hữu ích
  @Prop() emailVerified: boolean;
  @Prop() lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
