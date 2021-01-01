import React from "react";
import ReactExport from "react-export-excel";
import { Button } from "antd";
import { FileExcelFilled } from "@ant-design/icons";
import { css } from "@emotion/core";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const multiDataSet = [
  {
    columns: ["Headings", "Text Style", "Colors"],
    data: [
      [
        { value: "H1", style: { font: { sz: "24", bold: true } } },
        { value: "Bold", style: { font: { bold: true } } },
        {
          value: "Red",
          style: {
            fill: { patternType: "solid", fgColor: { rgb: "FFFF0000" } },
          },
        },
      ],
      [
        { value: "H2", style: { font: { sz: "18", bold: true } } },
        { value: "underline", style: { font: { underline: true } } },
        {
          value: "Blue",
          style: {
            fill: { patternType: "solid", fgColor: { rgb: "FF0000FF" } },
          },
        },
      ],
      [
        { value: "H3", style: { font: { sz: "14", bold: true } } },
        { value: "italic", style: { font: { italic: true } } },
        {
          value: "Green",
          style: {
            fill: { patternType: "solid", fgColor: { rgb: "FF00FF00" } },
          },
        },
      ],
      [
        { value: "H4", style: { font: { sz: "12", bold: true } } },
        { value: "strike", style: { font: { strike: true } } },
        {
          value: "Orange",
          style: {
            fill: { patternType: "solid", fgColor: { rgb: "FFF86B00" } },
          },
        },
      ],
      [
        { value: "H5", style: { font: { sz: "10.5", bold: true } } },
        { value: "outline", style: { font: { outline: true } } },
        {
          value: "Yellow",
          style: {
            fill: { patternType: "solid", fgColor: { rgb: "FFFFFF00" } },
          },
        },
      ],
      [
        { value: "H6", style: { font: { sz: "7.5", bold: true } } },
        { value: "shadow", style: { font: { shadow: true } } },
        {
          value: "Light Blue",
          style: {
            fill: { patternType: "solid", fgColor: { rgb: "FFCCEEFF" } },
          },
        },
      ],
    ],
  },
];
interface IInfoChart {
  id: string;
  exclusion: any;
  xChars?: string;
  words?: string;
  psa_line?: any;
  psa_link?: string;
  keyword: string;
  state?: any;
  syncedAt?: any;
  psa_variant?: any;
  created_at?: any;
}

const ExportExcel = (props: { data: IInfoChart[] }) => {
  const { data } = props;
  let dataExcel = {
    columns: [
      "Card",
      "Exclusions",
      "PSA Link",
      "PSA #.line",
      "PSA variant",
      "Special Char.",
    ],
    data: null,
  };
  const convertData = data.map((chart) => {
    return [
      {
        value: chart.keyword,
        style: { font: { sz: "10" } },
      },
      {
        value: chart.words,
        style: { font: { sz: "10" } },
      },
      {
        value: chart.psa_link ? chart.psa_link : "",
        style: { font: { sz: "10" } },
      },
      {
        value: chart.psa_line ? `${chart.psa_line}` : "",
        style: { font: { sz: "10" } },
      },
      {
        value: chart.psa_variant ? chart.psa_variant.toString() : "",
        style: { font: { sz: "10" } },
      },
      {
        value: "?",
        style: { font: { sz: "10" } },
      },
    ];
  });
  dataExcel = { ...dataExcel, data: convertData };
  return (
    <div>
      <ExcelFile
        element={
          <Button
            css={css`
              margin-left: 5px;
              background: #3cb371;
              border: none;
            `}
            type="primary"
            color="#fff"
            icon={<FileExcelFilled />}
          >
            Export Excel
          </Button>
        }
      >
        <ExcelSheet dataSet={[dataExcel]} name="Chart Info" />
      </ExcelFile>
    </div>
  );
};

export default ExportExcel;
