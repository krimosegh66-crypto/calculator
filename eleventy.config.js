import { addIconShortcode, ICONS } from "./src/_includes/partials/icons.js";
import calculatorsData from "./src/_data/calculators.js";

export default function (eleventyConfig) {
  // ---- Passthrough static assets ----
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // ---- Watch for changes outside of templates ----
  eleventyConfig.addWatchTarget("src/assets");

  // ---- Filters ----
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("limit", (arr, count) => (arr || []).slice(0, count));
  eleventyConfig.addFilter("sum", (arr, key) => (arr || []).reduce((n, i) => n + (i[key] || 0), 0));
  eleventyConfig.addFilter("readableDate", (dateObj) =>
    new Date(dateObj).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
  );
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("toUTCString", (dateObj) => new Date(dateObj).toUTCString());
  eleventyConfig.addFilter("readingTime", (content) => {
    const words = String(content).replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 210));
  });
  eleventyConfig.addFilter("strip", (str) => String(str).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
  eleventyConfig.addFilter("escapeXml", (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  );

  // ---- Shortcodes ----
  addIconShortcode(eleventyConfig);

  // Reusable ad placeholder. type: leaderboard | sidebar | in-content | mobile-sticky | footer
  eleventyConfig.addShortcode("adSlot", function (type, label) {
    const labels = {
      leaderboard: "Header Leaderboard Banner Ad (728×90)",
      sidebar: "Sidebar Ad (300×250)",
      "in-content": "In-Content Banner Ad (728×90)",
      "mobile-sticky": "Sticky Mobile Ad (320×50)",
      footer: "Footer Banner Ad (970×90 / 728×90)",
    };
    const text = label || labels[type] || "Advertisement";
    return `<ins class="ad-slot ad-${type}" data-ad-placeholder aria-hidden="true"><span>${text}</span></ins>`;
  });

  // Slim search index embedded on every page for instant suggestions.
  eleventyConfig.addShortcode("searchIndex", () => {
    const slim = calculatorsData.map((c) => ({
      slug: c.slug,
      urlSlug: c.urlSlug,
      name: c.name,
      teaser: c.teaser,
      categoryName: c.categoryName,
      popular: !!c.popular,
      keywords: c.keywords || [],
    }));
    return `<script id="search-index" type="application/json">${JSON.stringify(slim).replace(/</g, "\\u003c")}</script>`;
  });

  // ---- Collections ----
  eleventyConfig.addCollection("blog", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/blog/posts/*.md").sort((a, b) => a.date - b.date)
  );
  eleventyConfig.addCollection("popular", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/calculators/*.njk").filter((p) => p.data.calculator?.popular)
  );

  // ---- Template engines ----
  eleventyConfig.setTemplateFormats(["njk", "md", "html"]);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
    passthroughFileCopy: true,
  };
}