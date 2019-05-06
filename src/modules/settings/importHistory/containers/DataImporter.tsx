import { AppConsumer } from 'appContext';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { DataImporter } from '../components';
import { handleXlsUpload } from '../utils';

type Props = {
  showLoadingBar: () => void;
  type: string;
  text: string;
};

type State = {
  uploadingXls: boolean;
};

class DataImporterContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      uploadingXls: false
    };
  }

  render() {
    const { showLoadingBar, type } = this.props;

    const uploadXls = e => {
      handleXlsUpload({
        e,
        type,
        beforeUploadCallback: () => {
          this.setState({ uploadingXls: true });
        },
        afterUploadCallback: response => {
          this.setState({ uploadingXls: false });

          if (response.status === 'error') {
            return Alert.error(response.message);
          }

          if (response.id) {
            localStorage.setItem('erxes_import_data', response.id);
            showLoadingBar();
          }
        }
      });
    };

    return (
      <DataImporter
        {...this.props}
        uploadXls={uploadXls}
        uploading={this.state.uploadingXls}
      />
    );
  }
}

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ showLoadingBar }) => (
        <DataImporterContainer {...props} showLoadingBar={showLoadingBar} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;