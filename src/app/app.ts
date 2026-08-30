import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DigitalStamp } from './layout/digital-stamp/digital-stamp';
import { TopBar } from './layout/top-bar/top-bar';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { CookieBanner } from './layout/cookie-banner/cookie-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DigitalStamp, TopBar, Header, Footer, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
