import { Object, Property } from "fabric-contract-api";

@Object()
export class User {
    @Property()
    public email: string;
}
