import TenderTable from "./TenderTable";

interface Props {
  title: string;
  data: any[];
}

export default function TenderSection({ title, data }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <TenderTable data={data} />
    </div>
  );
}
