import React from "react";
import _ from "lodash";
import { Form } from "react-bootstrap";

const ExcludeItem = ({ exclude, onCommonExclude, selectAll }) => {
  const MAX_ITEM_COLUMN_CHECK = 4;
  const parseColumnExclude = _.chunk(
    exclude.exclude_words,
    MAX_ITEM_COLUMN_CHECK
  );
  const handleExcludeWord = (type, label, isChecked) => {
    onCommonExclude(type, label, isChecked);
  };
  return (
    <div className="exclude_type_wrapper">
      <h1 className="exclude_title">{exclude.type}</h1>
      <div className="exclude_word_wrapper">
        {parseColumnExclude.map((columnExclude) => (
          <div className="column_exclude">
            {columnExclude.map((word) => (
              <Form.Check
                key={word.label}
                type="checkbox"
                id={word.label}
                checked={word.isChecked}
                label={word.label}
                name="common_exclude"
                onChange={() =>
                  handleExcludeWord(exclude.type, word.label, word.isChecked)
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExcludeItem;
