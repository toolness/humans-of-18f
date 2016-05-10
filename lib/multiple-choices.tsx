import React = require('react');

import * as Util from './util';
import * as Team from './team';

interface Props {
  currentMember: Team.TeamMember,
  teamMembers: Team.TeamMember[],
  numChoices: number,
  onCorrectAnswerChosen: () => void
}

interface State {
  currentChoices?: Team.TeamMember[],
  chosenChoices: boolean[]
}

function chooseMany<T>(answer: T, choicePool: T[], numChoices: number): T[] {
  let choices = new Array(numChoices);

  choices[Util.randomIndex(choices)] = answer;

  choicePool = Util.without(choicePool, answer);

  for (let i = 0; i < numChoices; i++) {
    if (choices[i] === answer) {
      continue;
    }

    choices[i] = Util.randomChoice(choicePool);

    choicePool = Util.without(choicePool, choices[i]);
  }

  return choices;
}

export default class MultipleChoices extends React.Component<Props, State> {
  state = {
    currentChoices: [],
    chosenChoices: []
  };

  handleChoiceClick = (member, i) => {
    if (member === this.props.currentMember) {
      this.props.onCorrectAnswerChosen();
    } else {
      let chosenChoices = this.state.chosenChoices.slice();
      chosenChoices[i] = true;
      this.setState({ chosenChoices: chosenChoices });
    }
  }

  resetState(props: Props) {
    this.setState({
      currentChoices: chooseMany(
        props.currentMember,
        props.teamMembers,
        props.numChoices
      ),
      chosenChoices: Util.filledArray(this.props.numChoices, false)
    });
  }

  componentWillMount() {
    this.resetState(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.currentMember !== this.props.currentMember) {
      this.resetState(nextProps);
    }
  }

  render() {
    return (
      <div className="multiple-choice-question">
        <img className="portrait" src={this.props.currentMember.image}/>
        <p>Who is this human?</p>
        <div>
          {this.state.currentChoices.map((member, i) => {
            let hasBeenChosen = this.state.chosenChoices[i];
            let className = hasBeenChosen ? "usa-button-disabled"
                                          : "usa-button-primary-alt";

            return (
              <div className="button_wrapper" key={i}>
                <button className={className} disabled={hasBeenChosen}
                  onClick={this.handleChoiceClick.bind(this, member, i) }>
                  {member.full_name}
                </button>
              </div>
            );
          }) }
        </div>
      </div>
    );
  }
}
