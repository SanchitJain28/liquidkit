#!/usr/bin/env node

import { Command } from "commander";
import { add } from "../src/commands/add.js";
import { list } from "../src/commands/list.js";
import { info } from "../src/commands/info.js";

const program = new Command();

program
  .name("liquidkit")
  .description("Shopify Liquid UI component library")
  .version("0.0.1");

program
  .command("add <component>")
  .description("Install a component into your Shopify theme")
  .option("--dir <path>", "theme root directory", "./")
  .option("--prefix <prefix>", "override the lk- namespace prefix", "lk-")
  .option("--force", "overwrite all existing files without prompting", false)
  .option("--dry-run", "show what would happen without writing files", false)
  .action(add);

program
  .command("list")
  .description("List all available components")
  .action(list);

program
  .command("info <component>")
  .description("Show component details, files, and manual steps")
  .action(info);

program.parse();
