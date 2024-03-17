import { Page, test } from '@playwright/test'
import { faker } from '@faker-js/faker'

import { APP_URL } from '../../constants'
import { login } from '../utils/login'

const createList = async (page: Page) => {
  await login(page)

  await page.waitForURL('**/home')
  await page.goto(`${APP_URL}/en-US/lists`)

  page.getByText('Create new list').click()

  await page.type('input[name="name"]', faker.internet.displayName())

  await page.type('textarea[name="description"]', faker.lorem.paragraphs(3))

  await page.click('button[type="submit"]')

  await page.waitForResponse(
    (resp) => resp.url().includes('/lists') && resp.status() === 200,
  )
}

test('should be able to create new list', async ({ page }) => {
  await createList(page)
})
