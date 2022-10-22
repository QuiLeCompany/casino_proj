import { Entity, Property } from "@mikro-orm/core";
import { Position } from "../rooms/schema/Position";
import { Rotation } from "../rooms/schema/Rotation";
import { AvatarState } from "../rooms/schema/AvatarState";
import { BaseEntity } from './BaseEntity';

/**
 * Entity to represent the user in the database and throughout the server 
 */
@Entity()
export class User extends BaseEntity {
    
    @Property() username!: string;
    @Property() email!: string;
    @Property() password!: string;
    @Property() pendingTokenId: string;
    @Property() pendingTokenTimestamp: number;
    @Property() activeTokenId: string;
    @Property() activeSessionId: string;
    @Property() coins: number;
}