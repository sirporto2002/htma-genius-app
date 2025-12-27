/**
 * Oxidation Validation Page
 *
 * Practitioner-only regression test suite
 * Route: /practitioner/oxidation-validation
 */

import React from "react";
import Head from "next/head";
import OxidationValidation from "../../components/OxidationValidation";

export default function OxidationValidationPage() {
  return (
    <>
      <Head>
        <title>Oxidation Validation | HTMA Genius (Practitioner)</title>
        <meta
          name="description"
          content="Regression test suite for oxidation type classification calibration"
        />
      </Head>

      <div className="validation-page">
        <OxidationValidation />
      </div>

      <style jsx>{`
        .validation-page {
          min-height: 100vh;
          background: #f9fafb;
          padding: 2rem 0;
        }
      `}</style>
    </>
  );
}
