'use client';
import DBCLayout from '@/components/DBCLayout';
import { Paper } from '@mui/material';
import DBCMarkdown from '@/components/DBCMarkdown';
import { useAuth } from '@/contexts/AuthProvider';
import DBCPaper from '@/components/DBCPaper';
import { withPublicRouteProtection } from '@/hocs/routeGuards';
import UserHeaderButton from '@/components/UserHeaderButton';

const card1 = `
## Support Seekers

You guys are here because your lives have challenges that most of us don't have to face. We are here to help, not charge.

You don't pay to use other introduction agencies. So you won't pay here, either.

We hope you choose to use us because your support workers get a much better deal. Your funding goes to the people who
support you and not the fat-cat middle men.
`;

const card2 = `
## Support Providers

Instead of the industry standard, ongoing commissions, our plan is to charge a monthly membership fee to enable you to
make contact with prospective clients.

How much?

That is going to depend on how much value we can offer you. Realistically, at this point in time, that is not much.

**Drop Bear Care** is still very much a bare-bones application. I am going to continue working my butt off to add features
and improve it's functionality. But, at the end of the day, it doesn't matter how good it is, without you - lots of you -
it is not worth anything. It's value depends entirely on the community that adopts it.

So, for now, it is free.

But I can't afford to continue to provide this service for free indefinitely. It has cost a significant amount of time,
money and effort to get to this stage and get **Drop Bear Care** to launch.

Over time, as the community grows, the price will rise. I am envisaging a long-term price of around $50/month.  Still
incredibly cheap compared to the on-going commissions you pay to other similar introduction agencies.
`;

const card3 = `
## Early Adopters

Whilst I am currently offering this service for free, I also need an income in order to afford to dedicate myself full-time
to this project and improving your experience in using it.

So, I'd like to incentivise you to support me. I am currently offering monthly memberships of $10/month. If you join me at
this price, that will remain your price for as long as you remain a member.

Over time, the price will rise. But whatever pricing tier you start at, will remain your price for the life of your membership.

So, joining me now at $10/month will be an absolute bargain when the new member price reaches $50/month!
`;

const card4 = `
## Referrals

**Drop Bear Care** will never amount to anything without a community getting behind it.  I need your help to grow it.

I would like to encourage you to refer others on either side of the support network to ditch the commissions and join
**Drop Bear Care**.

For every support worker that you refer who takes up a subsciption, I will give you a 10% discount on your own membership
fees.  So, if you refer 10 new support workers, your own membership will be free!

It's a win-win.  As you help grow the community, `;

const Pricing: React.FC = () => {
  const { user } = useAuth();
  return (
    <>
      <DBCLayout
        title='Pricing Policies'
        {...(user
          ? { rightButton: <UserHeaderButton /> }
          : { showLoginButton: true })}
      />
      <DBCPaper>
        <DBCMarkdown text={card1} />
      </DBCPaper>
      <DBCPaper>
        <DBCMarkdown text={card2} />
      </DBCPaper>
      <DBCPaper>
        <DBCMarkdown text={card3} />
      </DBCPaper>
      <DBCPaper>
        <DBCMarkdown text={card4} />
      </DBCPaper>
    </>
  );
};

export default Pricing;
