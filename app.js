(function () {
    const config = window.PORTFOLIO || {};
    const projects = Array.isArray(config.projects) ? config.projects : [];
    const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
    const otherProjects = projects.filter((project) => !featuredProjects.includes(project));

    const projectList = document.getElementById("project-list");
    const otherWorkList = document.getElementById("other-work-list");
    const skillList = document.getElementById("skill-list");
    const socialLinks = document.getElementById("social-links");
    const dialog = document.getElementById("project-dialog");
    const dialogIcon = document.getElementById("dialog-icon");
    const dialogTitle = document.getElementById("dialog-title");
    const dialogCategory = document.getElementById("dialog-category");
    const dialogDescription = document.getElementById("dialog-description");
    const dialogTags = document.getElementById("dialog-tags");
    const dialogThumbs = document.getElementById("dialog-thumbs");
    const dialogImage = document.getElementById("dialog-image");
    const dialogCount = document.getElementById("dialog-count");
    const dialogLink = document.getElementById("dialog-link");
    const dialogClose = document.getElementById("dialog-close");
    const dialogPrev = document.getElementById("dialog-prev");
    const dialogNext = document.getElementById("dialog-next");
    const themeToggle = document.getElementById("theme-toggle");
    const introSequence = document.getElementById("intro-sequence");
    const workCursorPreview = document.getElementById("work-cursor-preview");
    const workCursorImage = document.getElementById("work-cursor-image");
    const workCursorName = document.getElementById("work-cursor-name");

    let activeProject = null;
    let activeShot = 0;
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
            const projectIndex = projects.indexOf(project);
            const previewShots = project.shots;
            const externalLink = project.href
                ? `<a href="${escapeHtml(project.href)}" target="_blank" rel="noreferrer">Store &nearr;</a>`
                : "";

            return `
                <article class="project reveal">
                    <span class="project-index">${String(index + 1).padStart(2, "0")}</span>

                    <div class="project-copy">
                        <div class="project-heading">
                            <img src="${escapeHtml(project.icon)}" alt="" loading="lazy">
                            <div>
                                <h3>${escapeHtml(project.name)}</h3>
                                <p class="project-category">${escapeHtml(project.category)}</p>
                            </div>
                        </div>
                        <p class="project-description">${escapeHtml(project.description)}</p>
                        <div class="project-actions">
                            <button type="button" data-preview="${projectIndex}">View screens &rarr;</button>
                            ${externalLink}
                        </div>
                    </div>

                    <button class="project-visual" type="button" data-preview="${projectIndex}" aria-label="View ${escapeHtml(project.name)} screenshots">
                        <span class="project-screen-stack" aria-hidden="true">
                            ${previewShots.map((shot, shotIndex) => `
                                <img
                                    class="project-screen project-screen-${shotIndex + 1}"
                                    src="${escapeHtml(shot)}"
                                    alt=""
                                    loading="lazy"
                                >
                            `).join("")}
                        </span>
                        <span class="screen-count">${project.shots.length} screens</span>
                    </button>
                </article>
            `;
        }).join("");
    };

    const renderOtherWork = () => {
        if (!otherWorkList) {
            return;
        }

        otherWorkList.innerHTML = otherProjects.map((project) => {
            const projectIndex = projects.indexOf(project);
            return `
                <button class="other-work-button" type="button" data-preview="${projectIndex}">
                    <span>${escapeHtml(project.name)}</span>
                    <span>&nearr;</span>
                </button>
            `;
        }).join("");
    };

    const renderDetails = () => {
        if (skillList) {
            const skills = config.skills || [];
            const primaryRoles = ["Core framework", "Language", "Toolchain"];
            const primarySkills = skills.slice(0, 3);
            const secondarySkills = skills.slice(3);

            skillList.innerHTML = `
                <div class="skill-primary-row">
                    ${primarySkills.map((skill, index) => `
                        <div class="skill-primary">
                            <span class="skill-number">0${index + 1}</span>
                            <span class="skill-name">${escapeHtml(skill)}</span>
                            <span class="skill-role">${primaryRoles[index]}</span>
                        </div>
                    `).join("")}
                </div>
                <span class="skill-secondary-label">Also working with</span>
                <div class="skill-secondary-row">
                    ${secondarySkills.map((skill) => `<span class="skill-secondary">${escapeHtml(skill)}</span>`).join("")}
                </div>
            `;
        }

        if (socialLinks) {
            socialLinks.innerHTML = (config.socialLinks || [])
                .map((link) => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`)
                .join("");
        }
    };

    const renderDialog = () => {
        if (!activeProject?.shots?.length) {
            return;
        }

        const shots = activeProject.shots;
        activeShot = (activeShot + shots.length) % shots.length;
        dialogTitle.textContent = activeProject.name;
        dialogCategory.textContent = activeProject.category;
        dialogIcon.src = activeProject.icon;
        dialogIcon.alt = `${activeProject.name} icon`;
        dialogDescription.textContent = activeProject.description;
        dialogTags.innerHTML = (activeProject.tags || [])
            .map((tag) => `<span>${escapeHtml(tag)}</span>`)
            .join("");
        dialogImage.src = shots[activeShot];
        dialogImage.alt = `${activeProject.name} screenshot ${activeShot + 1}`;
        dialogCount.textContent = `${activeShot + 1} / ${shots.length}`;
        dialogThumbs.innerHTML = shots.map((shot, index) => `
            <button class="${index === activeShot ? "is-active" : ""}" type="button" data-dialog-shot="${index}" aria-label="View screenshot ${index + 1}">
                <img src="${escapeHtml(shot)}" alt="">
            </button>
        `).join("");
        dialogPrev.hidden = shots.length < 2;
        dialogNext.hidden = shots.length < 2;

        if (activeProject.href) {
            dialogLink.href = activeProject.href;
            dialogLink.hidden = false;
        } else {
            dialogLink.hidden = true;
        }
    };

    const openProject = (index) => {
        activeProject = projects[index];
        activeShot = 0;

        if (!activeProject || !dialog) {
            return;
        }

        renderDialog();
        dialog.showModal();
        document.body.style.overflow = "hidden";
    };

    const closeDialog = () => {
        if (dialog?.open) {
            dialog.close();
        }
        document.body.style.overflow = "";
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

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-preview]");
        if (trigger) {
            openProject(Number(trigger.dataset.preview));
        }
    });

    dialogClose?.addEventListener("click", closeDialog);
    dialogPrev?.addEventListener("click", () => {
        activeShot -= 1;
        renderDialog();
    });
    dialogNext?.addEventListener("click", () => {
        activeShot += 1;
        renderDialog();
    });
    dialogThumbs?.addEventListener("click", (event) => {
        const thumb = event.target.closest("[data-dialog-shot]");
        if (thumb) {
            activeShot = Number(thumb.dataset.dialogShot);
            renderDialog();
        }
    });
    dialog?.addEventListener("click", (event) => {
        if (event.target === dialog) {
            closeDialog();
        }
    });
    dialog?.addEventListener("close", () => {
        document.body.style.overflow = "";
    });

    document.addEventListener("keydown", (event) => {
        if (!dialog?.open) {
            return;
        }

        if (event.key === "ArrowLeft") {
            activeShot -= 1;
            renderDialog();
        }

        if (event.key === "ArrowRight") {
            activeShot += 1;
            renderDialog();
        }
    });

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

    if (otherWorkList && workCursorPreview && window.matchMedia("(pointer: fine)").matches) {
        otherWorkList.addEventListener("pointerover", (event) => {
            const trigger = event.target.closest("[data-preview]");
            const project = trigger ? projects[Number(trigger.dataset.preview)] : null;

            if (!project) {
                return;
            }

            workCursorImage.src = project.shots[0];
            workCursorName.textContent = project.name;
            workCursorPreview.classList.add("is-visible");
        });

        otherWorkList.addEventListener("pointermove", (event) => {
            workCursorPreview.style.setProperty("--cursor-x", `${event.clientX}px`);
            workCursorPreview.style.setProperty("--cursor-y", `${event.clientY}px`);
        });

        otherWorkList.addEventListener("pointerleave", () => {
            workCursorPreview.classList.remove("is-visible");
        });
    }

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
