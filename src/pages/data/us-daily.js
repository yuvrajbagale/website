import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../../components/layout'
import { FormatDate, FormatNumber } from '../../components/utils/format'
import { SyncInfobox } from '../../components/common/infobox'
import Table from '../../components/common/table'

const ContentPage = ({ data }) => (
  <Layout
    title="US Historical Data"
    navigation={data.allContentfulNavigationGroup.edges[0].node.pages}
  >
    <div
      dangerouslySetInnerHTML={{
        __html:
          data.allContentfulSnippet.edges[0].node
            .childContentfulSnippetContentTextNode.childMarkdownRemark.html,
      }}
    />

    <SyncInfobox />

    <Table useTableSaw>
      <caption>US Daily Cumulative Totals - 4 pm ET</caption>
      <thead>
        <tr>
          <th scope="col" data-tablesaw-priority="persist">
            Date
          </th>
          <th scope="col" data-tablesaw-priority="0">
            States Tracked
          </th>
          <th scope="col" data-tablesaw-priority="1">
            New Tests
          </th>
          <th scope="col" data-tablesaw-priority="1">
            Positive
          </th>
          <th scope="col" data-tablesaw-priority="1">
            Negative
          </th>
          <th scope="col" data-tablesaw-priority="2">
            Pos + Neg
          </th>
          <th scope="col" data-tablesaw-priority="2">
            Pending
          </th>
          <th scope="col" data-tablesaw-priority="2">
            Deaths
          </th>
          <th scope="col" data-tablesaw-priority="2">
            Total Tests
          </th>
        </tr>
      </thead>
      <tbody>
        {data.allCovidUsDaily.edges.map(({ node }) => (
          <tr>
            <td>
              <FormatDate date={node.date} format="ccc LLL d yyyy" />
            </td>
            <td>{node.states}</td>
            <td>
              <FormatNumber number={node.totalTestResultsIncrease} />
            </td>
            <td>
              <FormatNumber number={node.positive} />
            </td>
            <td>
              <FormatNumber number={node.negative} />
            </td>
            <td>
              <FormatNumber number={node.positive + node.negative} />
            </td>
            <td>
              <FormatNumber number={node.pending} />
            </td>
            <td>
              <FormatNumber number={node.death} />
            </td>
            <td>
              <FormatNumber number={node.totalTestResults} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Layout>
)

export default ContentPage

export const query = graphql`
  query {
    allContentfulSnippet(filter: { slug: { eq: "us-daily" } }) {
      edges {
        node {
          childContentfulSnippetContentTextNode {
            childMarkdownRemark {
              html
            }
          }
        }
      }
    }
    allCovidUsDaily(sort: { order: DESC, fields: date }) {
      edges {
        node {
          totalTestResults
          totalTestResultsIncrease
          states
          positive
          pending
          negative
          hospitalized
          death
          date
        }
      }
    }
    allContentfulNavigationGroup(filter: { slug: { eq: "data" } }) {
      edges {
        node {
          pages {
            ... on ContentfulPage {
              title
              link: slug
            }
            ... on ContentfulNavigationLink {
              title
              link: url
            }
          }
        }
      }
    }
  }
`
