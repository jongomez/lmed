import { ReactNode } from "react";

export const tabProps = (index: number) => ({
  id: `simple-tab-${index}`,
  "aria-controls": `simple-tabpanel-${index}`,
});

type TabPanelProps = {
  children: ReactNode;
  value: number;
  index: number;
};

// Note: this could maybe be a react server component?
export const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <> {children} </>}
    </div>
  );
};
