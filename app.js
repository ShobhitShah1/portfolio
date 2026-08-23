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

    const renderProjects = () => {
        if (!projectList) {
            return;
        }

        projectList.innerHTML = featuredProjects.map((project, index) => {
            const externalLink = project.href
                ? `<a href="${escapeHtml(project.href)}" target="_blank" rel="noreferrer">View on store &nearr;</a>`
                : "";

            return `
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
                            ${externalLink}
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    };

    const renderOtherWork = () => {
        if (!otherWorkList) {
            return;
        }

        const renderItems = (duplicate = false) => otherProjects.map((project) => {
            const projectIndex = projects.indexOf(project);
            const tag = project.href ? "a" : "div";
            const link = project.href ? ` href="${escapeHtml(project.href)}" target="_blank" rel="noreferrer"` : "";
            return `
                <${tag} class="other-work-button" data-project-index="${projectIndex}"${link}${duplicate && project.href ? ` tabindex="-1"` : ""}>
                    <img src="${escapeHtml(project.icon)}" alt="" loading="lazy">
                    <span class="other-work-copy"><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.category)}</small></span>
                    <span>${project.href ? "&nearr;" : ""}</span>
                </${tag}>
            `;
        }).join("");

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
            supportingSkillList.innerHTML = (config.supportingSkills || [])
                .map((skill) => `<span>${escapeHtml(skill)}</span>`)
                .join("");
        }

        if (socialLinks) {
            socialLinks.innerHTML = (config.socialLinks || [])
                .map((link) => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`)
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
