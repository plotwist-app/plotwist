import { test } from '@playwright/test'

import { login } from './utils/login'

test('should be able to submit login form and redirect to home page', async ({
  page,
}) => {
  await login(page)
})
