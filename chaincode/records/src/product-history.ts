import { Object, Property } from "fabric-contract-api";
import "./user";
import { User } from "./user";

@Object()
export class ProductHistory {
    @Property()
    public time: string;

    @Property()
    public location: string;

    @Property()
    public owner: User;

    @Property()
    public cost: string;

    @Property()
    public txId: string;
}
