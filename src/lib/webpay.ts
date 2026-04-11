import { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } from "transbank-sdk";

const isProduction = process.env.WEBPAY_ENV === "production";

if (isProduction && (!process.env.WEBPAY_COMMERCE_CODE || !process.env.WEBPAY_API_KEY)) {
  throw new Error("WEBPAY_COMMERCE_CODE y WEBPAY_API_KEY son requeridos en producción.");
}

const commerceCode = isProduction
  ? process.env.WEBPAY_COMMERCE_CODE!
  : IntegrationCommerceCodes.WEBPAY_PLUS;

const apiKey = isProduction
  ? process.env.WEBPAY_API_KEY!
  : IntegrationApiKeys.WEBPAY;

const environment = isProduction ? Environment.Production : Environment.Integration;

const options = new Options(commerceCode, apiKey, environment);

export const webpayTransaction = new WebpayPlus.Transaction(options);
