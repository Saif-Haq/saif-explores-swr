import useSWR from 'swr';
import { request } from 'graphql-request';

// Define Rocket type
type Rocket = {
    active: boolean;
    boosters: number;
    company: string;
    cost_per_launch: number;
    country: string;
    description: string;
    first_flight: string;
    id: string;
    name: string;
    stages: number;
    success_rate_pct: number;
    type: string;
    wikipedia: string;
};

// GraphQL query
const GET_ROCKETS = `
  query {
    rockets {
      active
      boosters
      company
      cost_per_launch
      country
      description
      first_flight
      id
      name
      stages
      success_rate_pct
      type
      wikipedia
    }
  }
`;

// SWR fetcher for GraphQL
const fetcher = (query: string): Promise<{ rockets: Rocket[] }> =>
    request('https://spacex-production.up.railway.app/graphql', query);

// React component
const RocketList = () => {
    const { data, error } = useSWR<{ rockets: Rocket[] }>(GET_ROCKETS, fetcher);

    if (error) return <div>Failed to load rockets</div>;
    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h1>SpaceX Rockets</h1>
            <ul>
                {data.rockets.map((rocket: Rocket) => (
                    <li key={rocket.id}>
                        <h2>{rocket.name}</h2>
                        <p>Company: {rocket.company}</p>
                        <p>Country: {rocket.country}</p>
                        <p>First Flight: {rocket.first_flight}</p>
                        <p>Cost per Launch: ${rocket.cost_per_launch.toLocaleString()}</p>
                        <p>Success Rate: {rocket.success_rate_pct}%</p>
                        <p>{rocket.description}</p>
                        <a href={rocket.wikipedia} target="_blank" rel="noopener noreferrer">
                            Wikipedia
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RocketList;
