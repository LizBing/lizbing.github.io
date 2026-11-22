const details = document.querySelector("#workbench-details");

try {
  const response = await fetch("pl-learning-site/workbench-info.json", { cache: "no-cache" });
  if (response.ok) {
    const { courses, publishedAt, revision } = await response.json();
    if (/^[0-9a-f]{40}$/.test(revision)) {
      const counts = courses.map(({ name, lessons }) => {
        const label = lessons === 1 ? "lesson" : "lessons";
        return `${lessons} ${name} ${label}`;
      });
      const date = new Intl.DateTimeFormat(document.documentElement.lang, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(publishedAt));

      details.querySelector(".project-courses").textContent = counts.join(" · ");
      const time = details.querySelector("time");
      time.dateTime = publishedAt;
      time.textContent = date;
      details.querySelector("a").href = `https://github.com/LizBing/pl-learning-site/commit/${revision}`;
      details.hidden = false;
    }
  }
} catch {
  // The entry stays usable if the deployment information is unavailable.
}
