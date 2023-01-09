import { Object, Property } from "fabric-contract-api";
import "./user";
import { User } from "./user";
import "./product-history";
import { ProductHistory } from "./product-history";

@Object()
export class Product {
    @Property()
    public id: number;

    @Property()
    public name: string;

    @Property()
    public quantity: string;

    @Property()
    public owner: User;

    @Property("history", "Array<ProductHistory>")
    public history: ProductHistory[];

    @Property()
    public inAuction: boolean;
}
