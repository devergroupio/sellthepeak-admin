import gql from "graphql-tag";

export const FETCH_DEFINED_LIST = gql`
	query fetchDefinedList($limit: Int!, $offset: Int!) {
		defined_list(limit: $limit, offset: $offset) {
			id
			keyword
			syncedAt
			exclusion
			psa_link
			psa_line
		}
	}
`;

export const FETCH_TOTAL_DEFINED_LIST = gql`
	query fetchTotalDefinedList {
		defined_list_aggregate {
			aggregate {
				count
			}
		}
	}
`;

export const FETCH_DELETE_REQUESTION = gql`
	query fetchDeteteRequestion {
		delete_requestion(order_by: { id: desc }) {
			id
			item_id
			item {
				bids
				offerPrice
				shipping
				offerPrice
				shipping
				price
				soldDate
				soldType
				_data
			}
		}
	}
`;

export const FETCH_ID_DEFINED_LIST = gql`
	query fetchIdDefinedList($id: String!) {
		defined_list(where: { id: { _neq: $id } }) {
			keyword
			id
		}
	}
`;

export const FETCH_DAY_ANALYSIS_ITEMS = gql`
	query fetchDayAnalysis(
		$fromDate: timestamptz!
		$toDate: timestamptz!
		$id: String!
	) {
		analysis_items(
			args: { from_date: $fromDate, to_date: $toDate, search_id: $id }
			where: { day: { _is_null: false } }
		) {
			max_price
			day
			month
			year
			total_items
			min_price
			avg_price
		}
		defined_list(where: { id: { _eq: $id } }) {
			id
			keyword
			psa_data
			psa_line
			psa_link
		}
	}
`;

export const FETCH_MONTH_ANALYSIS_ITEMS = gql`
	query fetchMonthAnalysis(
		$fromDate: timestamptz!
		$toDate: timestamptz!
		$id: String!
	) {
		analysis_items(
			args: { from_date: $fromDate, to_date: $toDate, search_id: $id }
			where: { day: { _is_null: true }, month: { _is_null: false } }
		) {
			max_price
			day
			month
			year
			total_items
			min_price
			avg_price
		}
	}
`;

export const FETCH_YEAR_ANALYSIS_ITEMS = gql`
	query fetchYearAnalysis(
		$fromDate: timestamptz!
		$toDate: timestamptz!
		$id: String!
	) {
		analysis_items(
			args: { from_date: $fromDate, to_date: $toDate, search_id: $id }
			where: { day: { _is_null: false } }
		) {
			max_price
			day
			month
			year
			total_items
			min_price
			avg_price
		}
	}
`;

export const FETCH_SALES_CARD_BY_DAY = gql`
	query fetchSalesCardByDay(
		$definedId: String!
		$fromDate: timestamptz!
		$toDate: timestamptz!
		$limit: Int = 20
		$offset: Int!
	) {
		defined_list_item(
			where: {
				defined_list_id: { _eq: $definedId }
				item: { soldDate: { _gt: $fromDate, _lt: $toDate } }
			}
			limit: $limit
			offset: $offset
		) {
			id
			item_id
			defined_list_id
			item {
				bids
				offerPrice
				shipping
				offerPrice
				shipping
				price
				soldDate
				soldType
				_data
				id
			}
		}
	}
`;

export const FETCH_MORE_DEFINED_ITEM = gql`
	query fetchMoreDefinedItem(
		$list_id: String!
		$limit: Int = 20
		$offset: Int!
	) {
		defined_list_item(
			where: { defined_list_id: { _eq: $list_id } }
			limit: $limit
			offset: $offset
		) {
			defined_list_id
			item {
				bids
				offerPrice
				shipping
				offerPrice
				shipping
				price
				soldDate
				soldType
				_data
				id
			}
		}
	}
`;

export const FETCH_COMMON_EXCLUDE_LIST = gql`
	query fetchCommonExcludeList {
		common_exclude_list {
			type
			exclude_words
			id
			used_time
		}
	}
`;

export const FETCH_NAME_CARD = gql`
	query fetchNameCard($id: String!) {
		defined_list(where: { id: { _eq: $id } }) {
			keyword
		}
	}
`;

export const FETCH_PROXY_SETTING = gql`
	query fetchProxySetting {
		setting {
      proxy
      id
		}
	}
`;

export const FETCH_NEEDED_CREATE_SHORTCODE = gql`
  query neededCreateShortCode {
    defined_list {
      id
      keyword
    }
  }
`;
