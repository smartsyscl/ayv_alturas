import { expect, test } from "@playwright/test";

test("flujo principal: cotizar y visualizar en admin", async ({ page }) => {
  const unique = Date.now();
  const contactName = `QA ${unique}`;
  const clientEmail = `qa-${unique}@example.com`;
  const adminUser = process.env.ADMIN_USERNAME ?? "demo";
  const adminPass = process.env.ADMIN_PASSWORD ?? "demo";

  await page.goto("/cotizar?service=facade_painting");

  await page.getByLabel("Nombre Completo").fill(contactName);
  await page.getByLabel("Email").fill(clientEmail);
  await page.getByLabel("Teléfono").fill("+56912345678");
  await page.getByRole("button", { name: "Siguiente" }).click();

  await page.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Casa" }).click();
  await page.getByLabel("Dirección").fill("Calle QA 123");
  await page.getByLabel("Detalle Adicional (opcional)").fill("Referencia QA");
  await page.getByRole("button", { name: "Siguiente" }).click();

  await page.getByText("Pintura Interior", { exact: true }).click();
  await page.getByLabel("Número de Pisos de la Casa").fill("2");
  await page.getByRole("button", { name: "Siguiente" }).click();

  // Paso 4: Medidas y Cotización
  // Marcar checkbox de visita técnica
  const visitLabel = page.getByText("Solicitar visita técnica y toma de medidas");
  await visitLabel.scrollIntoViewIfNeeded();
  await visitLabel.click();

  // Aceptar términos
  const termsLabel = page.getByText("Acepto los términos y condiciones");
  await termsLabel.scrollIntoViewIfNeeded();
  await termsLabel.click();

  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(page.getByText("Solicitud Enviada", { exact: true })).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Usuario").fill(adminUser);
  await page.getByLabel("Contraseña").fill(adminPass);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.waitForURL("**/admin");
  await page.goto("/admin/quotes");

  await expect(page.getByText(contactName)).toBeVisible();

  // Expandir la tarjeta para ver el detalle
  await page.getByText(contactName).click();
  await expect(page.getByText(clientEmail)).toBeVisible();
});
