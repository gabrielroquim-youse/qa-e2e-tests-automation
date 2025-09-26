import { test, expect, request } from '@playwright/test'
import { LoginPage } from "../pages/LoginPage";

let login: LoginPage;

test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.open();
    await login.doLogin();
})

test('teste', async ({ page }) => {
    await login.infosCar();
})