import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Button } from 'react-bootstrap';

import { Link } from '../server/pages';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Body from '../components/Body';
import ErrorPage from '../components/ErrorPage';

import { getCollectiveApplicationsQuery } from '../graphql/queries';

import withData from '../lib/withData';
import withLoggedInUser from '../lib/withLoggedInUser';

class Apps extends React.Component {
  static getInitialProps({ query: { collectiveSlug } }) {
    return { collectiveSlug, slug: collectiveSlug };
  }

  static propTypes = {
    getLoggedInUser: PropTypes.func.isRequired,
    data: PropTypes.object,
    collectiveSlug: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  async componentDidMount() {
    const { getLoggedInUser } = this.props;
    const LoggedInUser = await getLoggedInUser();
    this.setState({ LoggedInUser, loading: false });
  }

  render() {
    const { data, collectiveSlug } = this.props;
    const { LoggedInUser, loading } = this.state;
    const { Collective } = data;

    if (loading) {
      return <ErrorPage loading={loading} data={data} />;
    }

    if (!data.Collective) {
      return <ErrorPage data={data} />;
    }

    return (
      <div>
        <style jsx>
          {`
            .apps {
              width: 80%;
              margin: 40px auto;
            }
            .actions {
              padding: 20px 0;
            }
            .app {
              border: 1px solid #ccc;
              margin: 20px 0;
              padding: 10px;
            }
          `}
        </style>
        <Header LoggedInUser={LoggedInUser} />
        <Body>
          {!LoggedInUser && <p>Authenticate to manage your apps.</p>}

          {Collective && (
            <div className="apps">
              <h3>My Applications</h3>

              {!Collective.applications ||
                (Collective.applications.length === 0 && <p>No application registered</p>)}

              {Collective.applications.length > 0 && (
                <Fragment>
                  {Collective.applications.map(application => (
                    <div className="app" key={application.id}>
                      <div className="name">
                        <Link
                          route="editApplication"
                          params={{ collectiveSlug, applicationId: application.id }}
                          >
                          <a>{application.name}</a>
                        </Link>
                      </div>
                      <div className="keys">
                        Client Id: <code>{application.clientId}</code>
                        <br />
                        Client Secret: <code>{application.clientSecret}</code>
                      </div>
                    </div>
                  ))}
                </Fragment>
              )}

              <div className="actions">
                <Link route="createApplication" params={{ collectiveSlug }}>
                  <Button bsStyle="primary">New App</Button>
                </Link>
              </div>
            </div>
          )}
        </Body>
        <Footer />
      </div>
    );
  }
}

export const addCollectiveApplicationsData = graphql(getCollectiveApplicationsQuery);

export default withData(withLoggedInUser(addCollectiveApplicationsData(Apps)));
