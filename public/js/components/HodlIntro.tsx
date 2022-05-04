import styled from "styled-components";

const HodlIntro = ({
  staked,
  stakedFemale,
  perc,
  percFemale,
}: {
  staked: number;
  stakedFemale: number;
  perc: number;
  percFemale: number;
}) => {
  return (
    <>
      <HodlIntroContainer>
        <h2>
          MALE HODL STAKED: {staked} ({perc}%)
        </h2>
        <ProgressBar>
          <Progress className="intro-progress" style={{ width: `${perc}%` }} />
        </ProgressBar>
      </HodlIntroContainer>
      <HodlIntroContainer style={{ marginTop: 20 }}>
        <h2>
          FEMALE HODL STAKED: {stakedFemale} ({percFemale}%)
        </h2>
        <ProgressBar>
          <Progress
            className="intro-progress"
            style={{ width: `${percFemale}%` }}
          />
        </ProgressBar>
      </HodlIntroContainer>
    </>
  );
};

export default HodlIntro;

const HodlIntroContainer = styled.div`
  margin: 0 auto;
  margin-bottom: 50px;
  margin-top: 50px;
  width: 60%;

  h2 {
    margin-bottom: 20px;
  }
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  height: 50px;
  /* margin-bottom: 80px; */
  overflow: hidden;
  width: 100%;
`;

const Progress = styled.div`
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  height: 50px;
  width: 0px;
`;
