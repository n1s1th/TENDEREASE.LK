"use client";

interface DepartmentFilterProps {
  value: string;
  onChange: (value: string) => void;
  departments?: string[];
}

const defaultDepartments = [
  "Planning Division",
  "Procurement Unit",
  "Infrastructure Development",
  "Supplies Division",
  "Logistics Division",
  "Engineering Branch",
  "Roads Development",
  "Public Transport Division",
  "Irrigation & Water Management",
  "Research & Development",
];

export default function DepartmentFilter({
  value,
  onChange,
  departments = defaultDepartments,
}: DepartmentFilterProps) {
  return (
    <div className="dash-filter-row" id="department-filter">
      <label className="dash-filter-label">Select the Department</label>
      <select
        className="dash-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All Departments</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  );
}
