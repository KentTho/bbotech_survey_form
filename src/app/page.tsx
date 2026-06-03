import React from 'react';
import { Metadata } from "next";
import Hero from './components/home/hero';
import Why from './components/home/why';
import SurveyFlow from './components/home/survey-flow';
import About from './components/home/about';
export const metadata: Metadata = {
  title: "Property",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Why />
      <SurveyFlow />
      <About />
    </main>
  )
}
