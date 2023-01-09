import {
    Context,
    Contract,
    Info,
    Returns,
    Transaction,
    Property,
} from "fabric-contract-api";
import "./product";
import { Product } from "./product";
import "./user";
import { User } from "./user";
import "./product-history";
import { ProductHistory } from "./product-history";

@Info({
    title: "ProductContract",
    description: "Contract for creating and managing products",
})
export class ProductContract extends Contract {
    @Property()
    productId: number;

    constructor() {
        super("ProductContract");
        this.productId = 0;
    }

    @Transaction(false)
    @Returns("string")
    public async helloWorld(ctx: Context): Promise<string> {
        return "Hello World!";
    }

    @Transaction()
    @Returns("number")
    public async createProduct(
        ctx: Context,
        name: string,
        quantity: string,
        location: string,
        cost: string,
        user: User
    ): Promise<number> {
        const product: Product = new Product();
        product.name = name;
        product.quantity = quantity;
        product.owner = user;
        product.inAuction = false;
        const productHistory: ProductHistory = {
            location,
            owner: user,
            cost,
            time: new Date().toString(),
            txId: ctx.stub.getTxID(),
        };
        product.id = ++this.productId;
        product.history = [productHistory];
        const buffer: Buffer = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(`${this.productId}`, buffer);
        return this.productId;
    }

    @Transaction()
    public async transferProduct(
        ctx: Context,
        productId: string,
        location: string,
        cost: string,
        newOwner: User
    ): Promise<void> {
        const product: Product = await this.readProduct(ctx, productId);
        product.owner = newOwner;
        product.inAuction = false;
        const history: ProductHistory[] = product.history;
        history.push({
            location,
            owner: newOwner,
            cost,
            time: new Date().toString(),
            txId: ctx.stub.getTxID(),
        });
        product.history = history;
        const buffer: Buffer = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(`${productId}`, buffer);
    }

    @Transaction()
    public async putProductInAuction(
        ctx: Context,
        productId: string
    ): Promise<void> {
        const product: Product = await this.readProduct(ctx, productId);
        product.inAuction = true;
        const buffer: Buffer = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(`${productId}`, buffer);
    }

    @Transaction(false)
    @Returns("Product[]")
    public async getOwnedProducts(
        ctx: Context,
        user: User
    ): Promise<Product[]> {
        console.log(
            `Querying for products owned by ${JSON.stringify(user)}...`
        );
        const query = {
            selector: {
                "owner.email": {
                    $eq: user.email,
                },
            },
        };
        const iterator: any = await ctx.stub.getQueryResult(
            JSON.stringify(query)
        );
        const products: Product[] = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                const value = result.value.value.toString("utf8");
                console.log(value);
                const product: Product = JSON.parse(value) as Product;
                products.push(product);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return products;
    }

    @Transaction(false)
    @Returns("Product[]")
    public async getHistoryProducts(
        ctx: Context,
        user: User
    ): Promise<Product[]> {
        const query = {
            selector: {
                history: {
                    $elemMatch: {
                        "owner.email": {
                            $eq: user.email,
                        },
                    },
                },
                "owner.email": {
                    $ne: user.email,
                },
            },
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const products: Product[] = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                const value = result.value.value.toString();
                console.log(value);
                const product: Product = JSON.parse(value) as Product;
                products.push(product);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return products;
    }

    @Transaction(false)
    @Returns("Product[]")
    public async getInAuctionProducts(
        ctx: Context,
        user: User
    ): Promise<Product[]> {
        const query = {
            selector: {
                inAuction: {
                    $eq: true,
                },
                "owner.email": {
                    $ne: user.email,
                },
            },
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const products: Product[] = [];
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                const value = result.value.value.toString();
                console.log(value);
                const product: Product = JSON.parse(value) as Product;
                products.push(product);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return products;
    }


    @Transaction(false)
    @Returns("Product")
    public async readProduct(
        ctx: Context,
        productId: string
    ): Promise<Product> {
        console.log(`Reading product ${productId}`);
        const data: Uint8Array = await ctx.stub.getState(productId);
        const product: Product = JSON.parse(data.toString()) as Product;
        return product;
    }

    @Transaction()
    public async sellProduct(
        ctx: Context,
        productId: string,
        location: string,
        cost: string,
        user: User
    ): Promise<void> {
        const product: Product = await this.readProduct(ctx, productId);
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.owner.email !== user.email) {
            throw new Error("You are not the owner of this product");
        }
        const history: ProductHistory[] = product.history;
        const newOwner = {
            email: "none",
        };
        history.push({
            time: new Date().toString(),
            location,
            cost,
            owner: newOwner,
            txId: ctx.stub.getTxID(),
        });
        product.history = history;
        product.owner = newOwner;
        const buffer: Buffer = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(productId, buffer);
    }
}
