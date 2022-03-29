let $game = $(".game");
let $text = $(".game h3");
let $button = $(".game button");

$button.on("click", function () {
    $text.text(`${$text.text()} clicked`);
});