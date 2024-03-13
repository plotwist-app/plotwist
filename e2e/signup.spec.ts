import { expect, test } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { APP_URL } from '../constants'
import { getDictionary } from '@/utils/dictionaries'

test('Signup form submission', async ({ page }) => {
  const {
    sign_up_form: { sign_up_success: signUpSuccess },
    login_form: { login_success: loginSuccess },
  } = await getDictionary('en-US')

  await page.goto(`${APP_URL}/en-US/signup`)

  await page.type('input[name="username"]', faker.person.firstName())
  await page.type('input[name="email"]', faker.internet.email())
  await page.type('input[name="password"]', faker.internet.password())
  await page.click('button[type="submit"]')

  await page.waitForResponse(
    (resp) => resp.url().includes('/signup') && resp.status() === 200,
  )

  expect(page.getByText(signUpSuccess)).toBeVisible()

  const tokenResponse = await page.waitForResponse(
    (resp) => resp.url().includes('/token') && resp.status() === 200,
  )
  expect(tokenResponse.ok()).toBeTruthy()

  expect(page.getByText(loginSuccess)).toBeVisible()

  await page.waitForURL('**/home')
  expect(page.url()).toContain('/home')
})
