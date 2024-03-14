import { getDictionary } from '@/utils/dictionaries'
import { Page, expect } from '@playwright/test'
import { APP_URL, TESTING_USER } from '../../constants'

export async function login(page: Page) {
  const {
    login_form: { login_success: loginSuccess },
  } = await getDictionary('en-US')

  await page.goto(`${APP_URL}/en-US/login`)
  await page.type('input[name="email"]', TESTING_USER.email)
  await page.type('input[name="password"]', TESTING_USER.password)
  await page.click('button[type="submit"]')

  const tokenResponse = await page.waitForResponse(
    (resp) => resp.url().includes('/token') && resp.status() === 200,
  )

  expect(tokenResponse.ok()).toBeTruthy()
  await page.waitForSelector(`text=${loginSuccess}`)
  await page.waitForURL('**/home')

  expect(page.url()).toContain('/home')
}
