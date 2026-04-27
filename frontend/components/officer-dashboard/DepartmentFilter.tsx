"use client";

interface DepartmentFilterProps {
  value: string;
  onChange: (value: string) => void;
  departments?: string[];
}

const defaultDepartments = [
  "Education",
  "Agriculture",
  "Technology",
  "Health",
  "Transportation",
  "Finance",
  "Ministry of Infrastructure",
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
