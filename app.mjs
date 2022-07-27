import { readFile, writeFile } from "node:fs/promises";

const getAddedOnDate = (locationAndDateLine) => {
  const parts = locationAndDateLine.split("|");
  return parts[parts.length - 1].replace(/Added on /g, "").trim();
};

const getLocation = (locationAndDateLine) => {
  const parts = locationAndDateLine.split("|");
  const loc = /location (?<start>\d+)-?(?<end>\d+)?/.exec(
    parts[parts.length - 2]
  );
  const location = {
    start: loc.groups.start,
    end: loc.groups.end,
  };

  if (parts.length > 2) {
    const page = /page (?<pageNum>\d+)/.exec(parts[0]);
    location.page = page.groups.pageNum;
  }

  return location;
};

const rawClippings = await readFile("./My Clippings.txt", "utf8");
const individualClippings = rawClippings.split("==========");
const highlights = individualClippings.filter((x) =>
  x.includes("- Your Highlight")
);
const highlightLines = highlights.map((x) =>
  x.split("\n").filter((y) => y.length > 0)
);
const highlightsByBook = highlightLines.reduce((acc, curr) => {
  const book = curr[0];
  if (acc[book] && acc[book].highlights) {
    acc[book].highlights.push({
      location: getLocation(curr[1]),
      date: new Date(getAddedOnDate(curr[1])).toISOString(),
      text: curr[2],
    });
  } else {
    acc[book] = {
      highlights: [{
        location: getLocation(curr[1]),
        date: new Date(getAddedOnDate(curr[1])).toISOString(),
        text: curr[2],
      }],
    };
  }
  return acc;
}, {});

const highlightsByBookWithLastUpdated = Object.keys(highlightsByBook).reduce(
  (acc, curr) => {
    const book = highlightsByBook[curr];
    if (curr) {
      acc[curr] = {
        ...book,
        lastUpdated: book.highlights.reduce((a, c) => {
          return c.date > a ? c.date : a;
        }, ""),
      };
    }
    return acc;
  },
  {}
);

const highlightsToMarkdown = (title,book) => {
  return `
  # ${title}
  Last updated: ${book.lastUpdated}

  ${book.highlights.map(highlight => `
  ${highlight.location.page ? `Page: ${highlight.location.page} | ` : ""} Location: ${highlight.location.start}${highlight.location.end ? `-${highlight.location.end}` : ""} | Date highlighted: ${new Date(highlight.date).toLocaleDateString()}
  > ${highlight.text}
  `).join("\n")}
  `;
};

for await (const book of Object.keys(highlightsByBookWithLastUpdated)) {
   writeFile(`./books/(Book) - ${book}.md`, highlightsToMarkdown(book, highlightsByBookWithLastUpdated[book]));
}