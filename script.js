const sections = document.querySelectorAll("section");

function revealSections() {
    const trigger = window.innerHeight * 0.85;

    sections.forEach(section => {
        const top = section.getBoundingClientRect().top;

        if (top < trigger) {
            section.classList.add("show");
        }
    });
}

window.addEventListener("scroll", revealSections);

/* run once on load */
const slider = document.querySelector(".news-slider");
const items = document.querySelectorAll(".news-item");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

let index = 0;

function updateSlider() {
    slider.style.transform = `translateX(-${index * 100}%)`;
}

next.addEventListener("click", () => {
    if (index < items.length - 1) {
        index++;
        updateSlider();
    }
});

prev.addEventListener("click", () => {
    if (index > 0) {
        index--;
        updateSlider();
    }
});
