import React, { useState, useEffect } from "react";
import { Modal, Button, notification } from "antd";
import readXlsxFile from "read-excel-file";
import { useApolloClient } from "@apollo/react-hooks";
import { INSERT_DEFINED_LIST } from "~@/graphql/mutation";
import Redirect from "../components/Redirect";

const SheetJSFT = [
	"xlsx",
	"xlsb",
	"xlsm",
	"xls",
	"xml",
	"txt",
	"ods",
	"fods",
	"uos",
	"sylk",
	"dif",
	"dbf",
	"prn",
	"qpw",
	"123",
	"wb*",
	"wq*",
	"html",
	"htm",
]
	.map(function (x) {
		return "." + x;
	})
	.join(",");

const ModalAddExcelFile = ({ show, onHideModal }) => {
	const gqlClient = useApolloClient();
	const [dataExcel, setDataExcel] = useState([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [isRedirect, setIsRedirect] = useState(false);

	const addChart = async (values) => {
		await gqlClient
			.mutate({
				mutation: INSERT_DEFINED_LIST,
				variables: {
					item: {
						...values,
					},
					on_confict: {
						constraint: "defined_list_pkey",
						update_columns: ["exclusion", "psa_line", "psa_link"],
					},
				},
			})
			.then(() => setCount((prevCount) => prevCount + 1))
			.catch(() => {
				setLoading(false);
				notification.error({
					message: "Add new chart !",
					description: "Something went wrong, please try again !",
				});
			});
	};

	const onAddChart = async () => {
		setLoading(true);
		dataExcel.forEach((data) => addChart(data));
	};
	useEffect(() => {
		if (count) {
			if (count === dataExcel.length) {
				notification.success({
					message: "Add new chart !",
					description: "Success",
				});
				setIsRedirect(true);
			}
		}
	}, [count]);

	if (isRedirect) {
		return <Redirect to="/" />;
	}

	const handleChange = (e) => {
		readXlsxFile(e.target.files[0]).then((rows) => {
			setDataExcel(
				rows.slice(1).map((item: string[]) => ({
					id: `${item[0].toLowerCase().replace(/[^A-Z0-9]+/gi, "")}`,
					keyword: item[0],
					exclusion: { words: item[1], xchars: item[5] ? item[5] : "?" },
					psa_line: item[3] ? item[3] : "",
					psa_link: item[2] ? item[2] : "",
					psa_variant: item[4] ? item[4] : null
				}))
			);
		});
	};
	return (
		<Modal
			title="Add File Chart"
			visible={show}
			onCancel={onHideModal}
			footer={null}
		>
			<input type="file" accept={SheetJSFT} onChange={handleChange} />
			{dataExcel.length ? (
				<Button loading={loading} onClick={onAddChart} type="primary">
					Add
				</Button>
			) : (
				""
			)}
		</Modal>
	);
};

export default ModalAddExcelFile;
