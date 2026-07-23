import Shell from "@/components/Shell";
import ElectionCountdown from "@/components/ElectionCountdown";
import CalendarManager from "@/components/CalendarManager";

export default function Page(){
 return <Shell title="Calendário Eleitoral 2026">
  <ElectionCountdown/>
  <div className="mt-6"><CalendarManager/></div>
 </Shell>
}
