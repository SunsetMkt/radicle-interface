import {
  test,
  expect,
  projectFixtureUrl,
  bobRemote,
  aliceRemote,
  gitOptions,
} from "@tests/support/fixtures.js";

test("peer and branch switching", async ({ page }) => {
  await page.goto(projectFixtureUrl);
  await page.locator('role=link[name="8 commits"]').click();

  // Alice's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator(`text=${aliceRemote}`).click();
    await expect(page.getByTitle("Change peer")).toHaveText(
      `  did:key:${aliceRemote
        .substring(8)
        .substring(0, 6)}…${aliceRemote.slice(-6)} delegate`,
    );

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".history .teaser")).toHaveCount(8);

    const latestCommit = page.locator(".teaser").first();
    await expect(latestCommit).toContainText(
      "Adds a new markdown file with an image with a relative path",
    );
    await expect(latestCommit).toContainText("fcc9294");

    const earliestCommit = page.locator(".teaser").last();
    await expect(earliestCommit).toContainText(
      "Initialize an empty git repository",
    );
    await expect(earliestCommit).toContainText("36d5bbe");

    await page.getByTitle("Change branch").click();
    await page.locator("text=feature/branch").click();

    await expect(page.getByTitle("Current branch")).toContainText(
      "feature/branch d6318f7",
    );
    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".history .teaser")).toHaveCount(10);

    await page.getByTitle("Change branch").click();
    await page.locator("text=orphaned-branch").click();

    await expect(page.getByTitle("Current branch")).toContainText(
      "orphaned-branch af3641c",
    );
    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".group .teaser")).toHaveCount(1);
  }

  // Bob's peer.
  {
    await page.getByTitle("Change peer").click();
    await page.locator(`text=${bobRemote}`).click();
    await expect(page.getByTitle("Change peer")).toContainText(
      ` did:key:${bobRemote.substring(8).substring(0, 6)}…${bobRemote.slice(
        -6,
      )} `,
    );

    await expect(page.getByText("Tuesday, December 20, 2022")).toBeVisible();
    await expect(page.locator(".group").first().locator(".teaser")).toHaveCount(
      1,
    );

    await expect(page.getByText("Thursday, November 17, 2022")).toBeVisible();
    await expect(page.locator(".group").last().locator(".teaser")).toHaveCount(
      6,
    );

    const latestCommit = page.locator(".teaser").first();
    await expect(latestCommit).toContainText("Update readme");
    await expect(latestCommit).toContainText("ec5eb0b");

    const earliestCommit = page.locator(".teaser").last();
    await expect(earliestCommit).toContainText(
      "Initialize an empty git repository",
    );
    await expect(earliestCommit).toContainText("36d5bbe");
  }
});

test("relative timestamps", async ({ page }) => {
  await page.addInitScript(() => {
    window.initializeTestStubs = () => {
      window.e2eTestStubs.FakeTimers.install({
        now: new Date("December 21 2022 12:00:00").valueOf(),
        shouldClearNativeTimers: true,
        shouldAdvanceTime: false,
      });
    };
  });

  await page.goto(projectFixtureUrl);
  await page.locator('role=link[name="8 commits"]').click();

  await page.getByTitle("Change peer").click();
  await page.locator(`text=${bobRemote}`).click();
  await expect(page.getByTitle("Change peer")).toHaveText(
    ` did:key:${bobRemote.substring(8).substring(0, 6)}…${bobRemote.slice(
      -6,
    )} `,
  );
  const latestCommit = page.locator(".teaser").first();
  await expect(latestCommit).toContainText("Bob Belcher committed now");
  await expect(latestCommit).toContainText("ec5eb0b");
  const earliestCommit = page.locator(".teaser").last();
  await expect(earliestCommit).toContainText(
    "Alice Liddell committed last month",
  );
});

test("pushing changes while viewing history", async ({ page, peerManager }) => {
  const alice = await peerManager.startPeer({
    name: "alice",
    gitOptions: gitOptions["alice"],
  });
  await alice.startHttpd(8090);
  await alice.startNode();
  const { rid, projectFolder } = await alice.createProject("alice-project");
  await page.goto(`/seeds/127.0.0.1:8090/${rid}`);
  await page.locator('role=link[name="1 commit"]').click();
  await expect(page).toHaveURL(`/seeds/127.0.0.1:8090/${rid}/history`);

  await alice.git(["commit", "--allow-empty", "--message", "first change"], {
    cwd: projectFolder,
  });
  await alice.git(["push", "rad", "main"], {
    cwd: projectFolder,
  });
  await page.reload();
  await expect(page).toHaveURL(`/seeds/127.0.0.1:8090/${rid}/history`);
  await expect(page.locator('role=link[name="2 commits"]')).toBeVisible();
  await expect(page.getByTitle("Current branch")).toContainText("main 516fa74");

  await page.locator("text=alice-project").click();
  await expect(page).toHaveURL(`/seeds/127.0.0.1:8090/${rid}`);
  await page.locator('role=link[name="2 commits"]').click();

  await alice.git(
    [
      "commit",
      "--allow-empty",
      "--message",
      "after clicking the project title",
    ],
    {
      cwd: projectFolder,
    },
  );
  await alice.git(["push", "rad", "main"], {
    cwd: projectFolder,
  });
  await page.reload();
  await expect(page).toHaveURL(`/seeds/127.0.0.1:8090/${rid}/history`);
  await expect(page.locator('role=link[name="3 commits"]')).toHaveText(
    "3 commits",
  );
  await expect(page.getByTitle("Current branch")).toContainText("main bb9089a");
});
