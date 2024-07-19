import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import "zone.js";

import { AppComponent } from "./app/app.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [AppComponent],
  template: "<app-layout />"
})
export class App {}

bootstrapApplication(App);
