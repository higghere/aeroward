"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Clock, 
  Truck, 
  Building2, 
  Users, 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  HeartPulse,
  Cpu,
  Layers,
  Wind
} from "lucide-react";
import { mitigationService, PredictiveGrapPlan } from "@/backend/src/recommendations/mitigationService";

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState<"municipal" | "schools" | "hospitals" | "citizen" | "bms">("municipal");
  const plan: PredictiveGrapPlan = mitigationService.getPredictiveGrapPlan("Kanpur");

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-wider text-data-improvement font-semibold">
              Proactive Urban Ecosystem Regulation
            </span>
            <span className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-muted border border-border">
              Predictive GRAP &bull; Kanpur Airshed
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-text-primary">
            Predictive Pollution Mitigation &amp; Persona Guidance
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Enacting interventions 12 to 36 hours prior to nocturnal thermal inversion descent, preventing peak particulate surge accumulation.
          </p>
        </div>

        {/* Stagnation Lead Notice */}
        <div className="flex items-center gap-2 rounded-sm border border-accent/40 bg-surface-elevated px-3 py-2 text-xs">
          <Clock className="h-4 w-4 text-accent shrink-0" />
          <div>
            <div className="text-[10px] text-text-muted uppercase font-sans">Predicted Stagnation Lead</div>
            <div className="font-mono text-xs font-bold text-accent">12–36h Pre-Inversion Window</div>
          </div>
        </div>
      </div>

      {/* Reactive vs Predictive Comparison Metric Bar */}
      <div className="mt-6 border-t border-b border-border-subtle py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
          <div className="sm:pr-4">
            <span className="text-xs text-text-muted font-sans uppercase tracking-wider">
              Reactive Administrative Lag
            </span>
            <div className="mt-1 font-display text-xl font-bold text-danger">
              12 to 24 Hours Post-Breach
            </div>
            <p className="mt-1 text-xs text-text-secondary font-sans leading-relaxed">
              Conventional regulatory frameworks only dispatch interventions hours after public monitors cross severe hazard thresholds.
            </p>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-xs text-text-muted font-sans uppercase tracking-wider">
              Predictive Advance Lead Time
            </span>
            <div className="mt-1 font-display text-xl font-bold text-data-improvement">
              12 to 36 Hours Pre-Inversion
            </div>
            <p className="mt-1 text-xs text-text-secondary font-sans leading-relaxed">
              Enacted prior to boundary layer compression (PBLH &lt; 300m), arresting pollutant accumulation before ground trapping occurs.
            </p>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="text-xs text-text-muted font-sans uppercase tracking-wider">
              Prevented Peak Mass Surge
            </span>
            <div className="mt-1 font-display text-xl font-bold text-accent">
              -32% Peak PM2.5 Surge
            </div>
            <p className="mt-1 text-xs text-text-secondary font-sans leading-relaxed">
              Empirical modeling demonstrates early afternoon silt stabilization and freight diversion suppresses nocturnal peak escalation by 22%–38%.
            </p>
          </div>
        </div>
      </div>

      {/* Persona Navigation Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setActiveTab("municipal")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 font-sans text-xs font-semibold transition-colors ${
            activeTab === "municipal"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "border border-border-subtle bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          <Truck className="h-4 w-4" /> Municipal Authority (GRAP)
        </button>

        <button
          onClick={() => setActiveTab("schools")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 font-sans text-xs font-semibold transition-colors ${
            activeTab === "schools"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "border border-border-subtle bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          <GraduationCap className="h-4 w-4" /> Schools &amp; Daycares
        </button>

        <button
          onClick={() => setActiveTab("hospitals")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 font-sans text-xs font-semibold transition-colors ${
            activeTab === "hospitals"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "border border-border-subtle bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          <HeartPulse className="h-4 w-4" /> Hospitals &amp; Clinics
        </button>

        <button
          onClick={() => setActiveTab("citizen")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 font-sans text-xs font-semibold transition-colors ${
            activeTab === "citizen"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "border border-border-subtle bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          <Users className="h-4 w-4" /> Citizens &amp; Commuters
        </button>

        <button
          onClick={() => setActiveTab("bms")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 font-sans text-xs font-semibold transition-colors ${
            activeTab === "bms"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "border border-border-subtle bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          <Cpu className="h-4 w-4" /> Smart Building Automation
        </button>
      </div>

      {/* TAB 1: MUNICIPAL PREDICTIVE GRAP (Flush Tabular Layout) */}
      {activeTab === "municipal" && (
        <div className="mt-8">
          <div className="border-b border-border-strong pb-3">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Municipal Predictive Dispatch Matrix (12–36h Advance Execution)
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Automated operational protocols dispatched to urban local bodies, traffic police, and environmental enforcement wings.
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {plan.municipalActions.map((action) => (
              <div key={action.id} className="py-6 transition-colors hover:bg-surface-elevated/40">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                  <div className="md:col-span-4">
                    <span className="font-mono text-xs font-bold text-accent">
                      {action.leadTimeHours}h ADVANCE DISPATCH
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-text-primary">
                      {action.category}
                    </h3>
                    <div className="mt-1 text-xs text-text-muted font-sans">
                      Target Corridor: <span className="text-text-secondary font-medium">{action.targetCorridorOrZone}</span>
                    </div>
                    <div className="mt-1 text-xs text-text-muted font-sans">
                      Authority: <span className="text-text-secondary">{action.responsibleAgency}</span>
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-2 text-xs font-sans text-text-secondary leading-relaxed">
                    <div>
                      <strong className="text-text-primary">Trigger Condition:</strong> {action.triggerCondition}
                    </div>
                    <div>
                      <strong className="text-text-primary">Action Protocol:</strong> {action.actionProtocol}
                    </div>
                    <div className="text-data-improvement font-medium">
                      Atmospheric Benefit: {action.expectedAtmosphericBenefit}
                    </div>
                  </div>

                  <div className="md:col-span-3 text-xs font-sans text-text-muted leading-relaxed pl-0 md:pl-4 border-l-0 md:border-l border-border-subtle">
                    <span className="text-text-secondary font-medium">Operational Window:</span>
                    <div className="mt-1 font-mono text-[11px] text-text-primary">{action.operationalWindow}</div>
                    <div className="mt-2 text-[11px] text-text-muted">
                      Constraint: {action.uncertaintyAndLimitation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOLS & EARLY DAYCARES */}
      {activeTab === "schools" && (
        <div className="mt-8">
          <div className="border-b border-border-strong pb-3">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Educational Institutions &amp; Daycares Advisory Protocol
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Actionable operational schedule protecting pediatric lungs from peak nocturnal and early-morning inversion exposure.
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {plan.schoolAdvisories.map((sch, idx) => (
              <div key={idx} className="py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4">
                    <span className="text-xs uppercase tracking-wider text-accent font-semibold font-sans">
                      Actionable Trigger Ceiling
                    </span>
                    <div className="mt-1 text-sm font-semibold text-text-primary font-sans">
                      {sch.actionableThreshold}
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4 text-xs font-sans text-text-secondary leading-relaxed">
                    <div className="border-l-2 border-danger pl-4">
                      <strong className="font-display text-sm font-bold text-text-primary block">
                        Mandatory Outdoor Activity Restriction
                      </strong>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
                        {sch.outdoorActivityRestriction}
                      </p>
                    </div>

                    <div className="border-l-2 border-warning pl-4">
                      <strong className="font-display text-sm font-bold text-text-primary block">
                        Morning Campus Arrival Rescheduling
                      </strong>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
                        {sch.morningArrivalAdvisory}
                      </p>
                    </div>

                    <div className="border-l-2 border-data-weather pl-4">
                      <strong className="font-display text-sm font-bold text-text-primary block">
                        Classroom HEPA Pre-Filtration Runtime Cycle
                      </strong>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
                        {sch.indoorHepaRuntimeSchedule}
                      </p>
                    </div>

                    <div className="border-l-2 border-data-improvement pl-4">
                      <strong className="font-display text-sm font-bold text-text-primary block">
                        Classroom CO₂ vs Particulate Infiltration Ventilation Protocol
                      </strong>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed font-sans">
                        {sch.co2VsAerosolVentilationProtocol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HOSPITALS & HEALTHCARE FACILITIES */}
      {activeTab === "hospitals" && (
        <div className="mt-8">
          <div className="border-b border-border-strong pb-3">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Hospital &amp; Healthcare Facilities Predictive Protocol
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Clinical protocols mitigating airborne vulnerability in ICUs, neonatal wards, and emergency respiratory intake bays.
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {plan.hospitalAdvisories.map((hosp, idx) => (
              <div key={idx} className="py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-t border-border-subtle pt-4">
                    <span className="text-xs uppercase tracking-wider text-accent font-semibold font-sans">
                      Protective Airway Pressurization
                    </span>
                    <h3 className="mt-1 font-display text-base font-bold text-text-primary">
                      Vulnerable Ward Intake Filtration (+20 to +25 Pa)
                    </h3>
                    <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
                      {hosp.vulnerableWardFiltrationProtocol}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle pt-4">
                    <span className="text-xs uppercase tracking-wider text-danger font-semibold font-sans">
                      18-Hour Clinical Surge Notice
                    </span>
                    <h3 className="mt-1 font-display text-base font-bold text-text-primary">
                      Emergency Ward Pre-Staffing &amp; Nebulization Supply
                    </h3>
                    <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
                      {hosp.emergencyDepartmentPreStaffingAlert}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle pt-4">
                    <span className="text-xs uppercase tracking-wider text-data-weather font-semibold font-sans">
                      HVAC Stagnation Isolation
                    </span>
                    <h3 className="mt-1 font-display text-base font-bold text-text-primary">
                      Nocturnal Damper Damping (10–15% Outdoor Air)
                    </h3>
                    <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
                      {hosp.hvacFreshAirDamperActuation}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle pt-4">
                    <span className="text-xs uppercase tracking-wider text-warning font-semibold font-sans">
                      Patient Discharge Windows
                    </span>
                    <h3 className="mt-1 font-display text-base font-bold text-text-primary">
                      COPD &amp; Cardiovascular Convective Discharge Timing
                    </h3>
                    <p className="mt-2 text-xs text-text-secondary leading-relaxed font-sans">
                      {hosp.patientDischargeTimingGuidance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CITIZEN & COMMUTER MITIGATION GUIDANCE */}
      {activeTab === "citizen" && (
        <div className="mt-8">
          <div className="border-b border-border-strong pb-3">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Vulnerability-Stratified Citizen Exposure Protocols
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Synchronizing daily physical routines with the atmospheric boundary layer cycle to reduce inhaled dose.
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {plan.citizenGuidance.map((cit, idx) => (
              <div key={idx} className="py-6 transition-colors hover:bg-surface-elevated/40">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                  <div className="md:col-span-3">
                    <h3 className="font-display text-lg font-bold text-text-primary">
                      {cit.targetGroup}
                    </h3>
                    <div className="mt-2 text-xs text-text-muted font-sans">
                      Safe Window:
                      <div className="font-mono text-data-improvement font-bold text-xs mt-0.5">
                        {cit.recommendedTimeWindow}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-text-muted font-sans">
                      Avoid Window:
                      <div className="font-mono text-danger font-bold text-xs mt-0.5">
                        {cit.avoidTimeWindow}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 text-xs font-sans text-text-secondary leading-relaxed space-y-2">
                    <div>
                      <strong className="text-text-primary">Atmospheric Mechanics:</strong> {cit.exposureMinimaExplanation}
                    </div>
                    <div className="border-l-2 border-accent pl-3 text-text-secondary">
                      <strong className="text-accent font-medium">Indoor Sanctuary:</strong> {cit.indoorSanctuaryAction}
                    </div>
                  </div>

                  <div className="md:col-span-4 text-xs font-sans pl-0 md:pl-4 border-l-0 md:border-l border-border-subtle">
                    <span className="text-text-muted font-medium uppercase tracking-wider text-[11px] block">
                      Respiratory Mask Specification
                    </span>
                    <p className="mt-1 text-text-primary leading-relaxed">
                      {cit.maskSelectionProtocol}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SMART BUILDING AUTOMATION (BMS) */}
      {activeTab === "bms" && (
        <div className="mt-8">
          <div className="border-b border-border-strong pb-3">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              Automated Facility &amp; BMS Dynamic Dispatch Commands
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Direct machine-to-machine payloads transmitting across BACnet, Modbus-TCP, and IoT MQTT broker topologies.
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {plan.buildingAutomationCommands.map((cmd, idx) => (
              <div key={idx} className="py-6 transition-colors hover:bg-surface-elevated/40">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
                  <div className="md:col-span-4">
                    <span className="font-mono text-xs text-accent font-bold">
                      T-{cmd.targetTimeOffsetMinutes} MIN PRE-INVERSION DISPATCH
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-text-primary">
                      {cmd.bmsSubsystem}
                    </h3>
                    <div className="mt-1 text-xs text-text-muted font-sans">
                      Target Mode: <span className="text-text-secondary font-medium">{cmd.commandPayload.mode}</span>
                    </div>
                  </div>

                  <div className="md:col-span-5 text-xs font-sans text-text-secondary leading-relaxed">
                    <strong className="text-text-primary">Operational Rationale:</strong>
                    <p className="mt-1 text-text-secondary leading-relaxed">{cmd.operationalRationale}</p>
                  </div>

                  <div className="md:col-span-3 text-xs pl-0 md:pl-4 border-l-0 md:border-l border-border-subtle">
                    <span className="text-text-muted font-sans text-[11px] uppercase tracking-wider block">
                      BACnet / IoT Setpoint
                    </span>
                    <div className="mt-1 font-mono text-xs font-bold text-accent bg-surface p-2 border border-border-subtle rounded-sm">
                      {cmd.commandPayload.setpoint}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-text-muted">
                      Protocol: {cmd.commandPayload.protocol}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
