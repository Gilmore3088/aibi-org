#!/usr/bin/env python3
"""
Sandbox UI smoke walk: navigate to m2.3, m3.2, m3.5 and capture the
new sandbox surface. Does NOT click Run (would hit a real LLM); just
proves the lever controls, data-slot input, and preset picker render.
"""

import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

OUT = Path("/tmp/addie_walk")
BASE = "http://localhost:3001"


async def shoot(page, name, locator_id=None):
    target = OUT / f"sandbox-{name}.png"
    if locator_id:
        try:
            await page.locator(f'[data-testid="{locator_id}"]').wait_for(timeout=8000)
        except Exception as e:
            print(f"  warn: {locator_id} not found: {e}")
    await page.screenshot(path=str(target), full_page=True)
    print(f"  saved {target}")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()

        for slug, mod, lesson, expect_id in [
            ("m2.3", "m2", "m2.3", "sandbox-lesson-view"),
            ("m3.2", "m3", "m3.2", "sandbox-ab-lesson-view"),
            ("m3.5", "m3", "m3.5", "sandbox-lesson-view"),
        ]:
            url = f"{BASE}/foundation/{mod}/{lesson}"
            print(f"-> {url}")
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                await page.wait_for_load_state("networkidle", timeout=15000)
            except Exception as e:
                print(f"  load warn: {e}")
            await shoot(page, slug, expect_id)

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
