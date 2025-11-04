import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "src/config";
export default class Application {

  public static async main(): Promise<void> {
    let app = await NestFactory.create(AppModule);

    await app.listen(config.PORT, () => {
      console.log(`Server running on  ${config.PORT} port`);
    });
  }
}
