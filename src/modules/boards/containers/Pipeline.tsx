import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { EmptyState, Spinner } from '../../common/components';
import { queries } from '../graphql';
import { IItemMap, IPipeline, IStageMap, StagesQueryResponse } from '../types';
import { withProps } from '../utils';
import { PipelineConsumer, PipelineProvider } from './PipelineContext';
import { Stage } from './stage';

const Container = styled.div`
  height: 100%;
  display: inline-flex;
`;

type Props = {
  pipeline: IPipeline;
  initialItemMap?: IItemMap;
  stageMap?: IStageMap;
  queryParams: any;
  type: string;
};

class WithStages extends React.Component<Props, {}> {
  countStages(obj) {
    return Object.keys(obj).length;
  }

  render() {
    const {
      initialItemMap,
      pipeline,
      stageMap,
      queryParams,
      type
    } = this.props;
    const stagesCount = this.countStages(stageMap);

    if (stagesCount === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No stage in this pipeline"
          size="small"
        />
      );
    }

    return (
      <PipelineProvider
        pipeline={pipeline}
        initialItemMap={initialItemMap}
        queryParams={queryParams}
        type={type}
      >
        <PipelineConsumer>
          {({ stageLoadMap, itemMap, onDragEnd, stageIds }) => (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="pipeline"
                type="STAGE"
                direction="horizontal"
                ignoreContainerClipping={true}
              >
                {provided => (
                  <Container
                    innerRef={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {stageIds.map((stageId, index) => {
                      const stage = stageMap && stageMap[stageId];

                      if (!stage) {
                        return null;
                      }

                      return (
                        <Stage
                          type={type}
                          key={stageId}
                          index={index}
                          length={stagesCount}
                          stage={stage}
                          items={itemMap[stageId]}
                          search={queryParams.search}
                          loadingState={stageLoadMap[stageId]}
                        />
                      );
                    })}
                    {provided.placeholder}
                  </Container>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </PipelineConsumer>
      </PipelineProvider>
    );
  }
}

type WithStatesQueryProps = {
  stagesQuery: StagesQueryResponse;
} & Props;

const WithStatesQuery = (props: WithStatesQueryProps) => {
  const { stagesQuery, type } = props;

  if (stagesQuery.loading) {
    return <Spinner />;
  }

  const stages = stagesQuery[type + 'Stages'];

  const itemMap: IItemMap = {};
  const stageMap: IStageMap = {};

  for (const stage of stages) {
    itemMap[stage._id] = [];
    stageMap[stage._id] = stage;
  }

  return <WithStages {...props} stageMap={stageMap} initialItemMap={itemMap} />;
};

export default (props: Props) =>
  withProps<Props>(
    props,
    compose(
      graphql<Props, StagesQueryResponse>(gql(queries[props.type + 'Stages']), {
        name: 'stagesQuery',
        options: ({ pipeline, queryParams }) => ({
          variables: {
            pipelineId: pipeline._id,
            search: queryParams.search
          }
        })
      })
    )(WithStatesQuery)
  );