(function () {
    const config = window.PORTFOLIO || {};
    const projects = Array.isArray(config.projects) ? config.projects : [];
    const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
    const otherProjects = projects.filter((project) => !featuredProjects.includes(project));

    const projectList = document.getElementById("project-list");
    const otherWorkList = document.getElementById("other-work-list");
    const skillList = document.getElementById("skill-list");
    const skillCount = document.getElementById("skill-count");
    const supportingSkillList = document.getElementById("supporting-skill-list");
    const socialLinks = document.getElementById("social-links");
    const themeToggle = document.getElementById("theme-toggle");
    const introSequence = document.getElementById("intro-sequence");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const escapeHtml = (value) => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const icons = {
        play: '<svg class="store-logo store-logo-play" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00d7fe" d="M3.7 2.4a1.6 1.6 0 0 0-.45 1.13v16.94c0 .44.17.84.45 1.13L13.2 12 3.7 2.4Z"/><path fill="#ffce00" d="m16.36 8.8-3.17 3.2 3.17 3.2 3.8-2.13c1.12-.63 1.12-1.51 0-2.14l-3.8-2.13Z"/><path fill="#ff3a44" d="m3.7 21.6 12.66-6.4L13.2 12 3.7 21.6Z"/><path fill="#00f076" d="M3.7 2.4 13.2 12l3.16-3.2L3.7 2.4Z"/></svg>',
        apple: '<svg class="store-logo store-logo-app" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#0d96f6"/><path d="m7.4 17 4.6-8.7 4.6 8.7M9.2 14h5.6" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>',
        LinkedIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.34 3.5A2.34 2.34 0 1 1 5.34 8.18 2.34 2.34 0 0 1 5.34 3.5ZM3.32 9.75h4.04V20.5H3.32V9.75Zm6.57 0h3.88v1.47h.05c.54-1.02 1.86-2.1 3.83-2.1 4.1 0 4.86 2.7 4.86 6.21v5.17h-4.04v-4.58c0-1.09-.02-2.5-1.52-2.5-1.53 0-1.76 1.19-1.76 2.42v4.66h-4.04V9.75Z"/></svg>',
        GitHub: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.33c.98 0 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.07.79 2.16v3.03c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg>',
        Instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
        X: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4.2l4.25 5.67L17.4 4H20l-6.35 7.27L20.2 20H16l-4.75-6.34L5.7 20H3.1l6.95-7.94L4 4Zm3 1.8L17 18.2h1.2L8.2 5.8H7Z"/></svg>'
    };

    const renderStoreLinks = (project, duplicate = false) => [
        { label: "Google Play", href: project.playStore || project.href, icon: icons.play },
        { label: "App Store", href: project.appStore, icon: icons.apple }
    ].filter((store) => store.href).map((store) => `
        <a class="store-link" href="${escapeHtml(store.href)}" target="_blank" rel="noreferrer" aria-label="Open on ${store.label}" title="${store.label}"${duplicate ? ' tabindex="-1"' : ""}>${store.icon}</a>
    `).join("");

    const renderProjects = () => {
        if (!projectList) {
            return;
        }

        projectList.innerHTML = featuredProjects.map((project, index) => `
                <article class="project reveal">
                    <div class="project-logo-stage">
                        <span class="project-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                        <img src="${escapeHtml(project.icon)}" alt="${escapeHtml(project.name)} app icon" loading="lazy">
                    </div>

                    <div class="project-copy">
                        <p class="project-category">${escapeHtml(project.category)}</p>
                        <h3>${escapeHtml(project.name)}</h3>
                        <p class="project-feature-label">What it does</p>
                        <p class="project-description">${escapeHtml(project.description)}</p>
                        <div class="project-footer">
                            <p class="project-tags">${(project.tags || []).map(escapeHtml).join(" / ")}</p>
                            <div class="store-links">${renderStoreLinks(project)}</div>
                        </div>
                    </div>
                </article>
            `).join("");
    };

    const renderOtherWork = () => {
        if (!otherWorkList) {
            return;
        }

        const renderItems = (duplicate = false) => otherProjects.map((project) => `
            <article class="other-work-button">
                <div class="other-work-summary">
                    <img src="${escapeHtml(project.icon)}" alt="" loading="lazy">
                    <span class="other-work-copy"><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.category)}</small></span>
                </div>
                <div class="other-work-details">
                    <p>${escapeHtml(project.description)}</p>
                    <div class="store-links">${renderStoreLinks(project, duplicate)}</div>
                </div>
            </article>
        `).join("");

        otherWorkList.innerHTML = `
            <div class="other-work-track">
                <div class="other-work-group">${renderItems()}</div>
                <div class="other-work-group" aria-hidden="true">${renderItems(true)}</div>
            </div>
        `;
    };

    const renderDetails = () => {
        if (skillList) {
            const skills = config.skills || [];
            if (skillCount) {
                skillCount.textContent = `Core stack / ${skills.length} skills`;
            }
            skillList.innerHTML = skills
                .map((skill) => `<span class="skill-word">${escapeHtml(skill)}</span>`)
                .join("");
        }

        if (supportingSkillList) {
            const featuredSkills = new Set(config.featuredSupportingSkills || []);
            supportingSkillList.innerHTML = (config.supportingSkills || [])
                .map((skill) => `<span${featuredSkills.has(skill) ? ' class="is-featured"' : ""}>${escapeHtml(skill)}</span>`)
                .join("");
        }

        if (socialLinks) {
            socialLinks.innerHTML = (config.socialLinks || [])
                .map((link) => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(link.label)}" title="${escapeHtml(link.label)}">${icons[link.label] || escapeHtml(link.label)}</a>`)
                .join("");
        }
    };

    renderProjects();
    renderOtherWork();
    renderDetails();
    document.getElementById("year").textContent = new Date().getFullYear();

    const syncThemeToggle = () => {
        const isLight = document.documentElement.dataset.theme === "light";
        themeToggle?.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isLight ? "#f3f2ef" : "#111111");
    };

    syncThemeToggle();
    themeToggle?.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem("portfolio-theme", nextTheme);
        syncThemeToggle();
    });

    if (introSequence && !reduceMotion) {
        document.body.classList.add("is-intro");
        window.setTimeout(() => {
            introSequence.classList.add("is-finished");
        }, 1250);
        window.setTimeout(() => {
            document.body.classList.remove("is-intro");
        }, 2100);
    } else {
        introSequence?.classList.add("is-finished");
    }

    const revealNodes = document.querySelectorAll(".reveal");

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealNodes.forEach((node) => node.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

        revealNodes.forEach((node) => revealObserver.observe(node));
    }

    const header = document.querySelector(".site-header");
    const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));

    const updateHeader = () => {
        header?.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navLinks.forEach((link) => {
                        link.classList.toggle("is-active", link.hash === `#${entry.target.id}`);
                    });
                }
            });
        }, { rootMargin: "-38% 0px -55%", threshold: 0 });

        sections.forEach((section) => sectionObserver.observe(section));
    }
}());
