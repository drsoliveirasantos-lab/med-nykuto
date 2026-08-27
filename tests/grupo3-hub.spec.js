const { test, expect } = require('@playwright/test');
const { routeCurrentClassPublic } = require('./helpers/current-class-public-fixture');

const CLASS_DRIVE_URL = 'https://drive.google.com/drive/u/0/mobile/folders/1AE16HsBFgPw80tQYS_O5lQf3hsz9CFdy/1FWhE0vQoc7dNILKqa0qMrGfoF68ZElij?sort=13&direction=a';

test.describe('Class hub', () => {
  test.beforeEach(async ({ page }) => {
    await routeCurrentClassPublic(page);
    await page.goto('/clase.html');
  });

  require('./grupo3-hub/section-01.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-02.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-03.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-04.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-05.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-06.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-07.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-08.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-09.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-10.js')({ test, expect, CLASS_DRIVE_URL });
  require('./grupo3-hub/section-11.js')({ test, expect, CLASS_DRIVE_URL });
});
