# Development Log 1: Introduction

* [Return to the main Shift page](../index.md)

This first post in the development log of Shift explains the motivations behind the project, and the scope for the *Prelude* release.

## Why Shift?

Shift is a game that has been on my mind for literally decades. Early RPG experiences in games like *Ultima V*, countless hours spent playing text-based MUDs, and a healthy dose of D&D have created in me a love of exploring new worlds and getting lost in the stories that unfold within them.

For me, there's something about the interactive element to a deep RPG that feels much richer than stories told via books or television. Likewise, the stories that have stuck with me the most have been those told via pure text or simple graphics, and fueled by imagination. As amazing as the visuals of modern games have become, the cost of those visuals is limitations on the game's writers and designers&mdash;and the unfortunate closing of the mind's eye.

## Shift: Prelude

The vision for Shift is an ambitious one that will take a lot of work and most certainly several years to complete. Along the way I plan to release related, self-contained, projects that drive forward the overall feature set of the game.

The first of these projects is *Shift: Prelude*, a mini-adventure that will also serve as a prototype for several key RPG systems. To help keep me focused, and gain momentum, I am developing the prelude adventure for the [Crunchless Challenge](https://itch.io/jam/crunchless-challenge), and plan to release it as a complete game at the end of November 2021.

[![Crunchless Challenge](../../assets/shift/crunchless_logo.svg)](https://itch.io/jam/crunchless-challenge)

The rest of this log entry will explain the goals and overal technology decisions of the project.

## Goals for Shift: Prelude

In order to fulfill the purpose of building momentum and prototyping features for a more ambitious version of *Shift*, this project has the following goals:

* Publish a finished game that is satisfying to play
* Complete the entire process of developing, marketing, and publishing the finished product
* Implement several game systems to use on this and future projects, including:
  * Turn-based interactions and game loop
  * Map exploration
  * Procedural map generation
  * Simple monster AI behavior
  * Reasonable combat system and mechanics

## Tools

I will be using the following technologies to complete this project:

* **[Electron](https://www.electronjs.org/)**: The promise of Electron is being able to build a cross-platform application and gain the benefits of the web technology stack (Javascript, HTML, CSS). I am skeptical of its usefulnes as a platform for games, and so want to try it out myself.
* **HTML/CSS with [React.js](https://reactjs.org/)**: In theory, I can create game UI elements fairly quickly using HTML and CSS. I will be using React to render the game screens.
* **[Typescript](https://www.typescriptlang.org/)**: Given the above Javascript is obviously a requirement. I find Typescript to be a much more expressive and efficient language to use, and it was a natural fit since it's been a big part of my day job lately.
* **[Pixi.js](https://pixijs.com/)**: While the game will heavily rely on ASCII art, it's not going to run in a terminal. I will be using PIXI to render the game's map view, and anything else requiring high performance sprites or animation.

## Design Document

The [Shift: Prelude design document](https://github.com/skleinjung/shift/blob/main/docs/design.md) is on GitHub, and includes a lot more detail on the game's influences, UI patterns, and systems. I'm sure the final product will deviate quite a bit from this, but there is a lot of information there for anyone wanting to watch a project like this unfold.

* [Return to the main Shift page](../index.md)
